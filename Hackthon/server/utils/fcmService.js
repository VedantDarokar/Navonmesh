const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const DeviceToken = require('../models/DeviceToken');

// Cached OAuth2 access token for FCM HTTP v1
let cachedOAuthToken = null;
let tokenExpiry = 0;

/**
 * Loads the Firebase Service Account object from file or environment variable.
 */
function loadServiceAccount() {
    // 1. Check direct JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {
            console.warn('[FCM] Error parsing FIREBASE_SERVICE_ACCOUNT env string:', e.message);
        }
    }

    // 2. Check specified filename in env or default 'firebase-service-account.json'
    const fileName = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || 'firebase-service-account.json';
    const candidatePaths = [
        path.resolve(__dirname, '..', fileName),
        path.resolve(process.cwd(), fileName),
        path.resolve(__dirname, '..', '..', 'client', 'android', 'app', 'google-services.json')
    ];

    for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
            try {
                const data = JSON.parse(fs.readFileSync(p, 'utf8'));
                // Verify it's a service account key
                if (data.type === 'service_account' && data.private_key && data.client_email) {
                    return data;
                }
            } catch (e) {}
        }
    }

    return null;
}

/**
 * Generates an OAuth2 access token for Firebase Cloud Messaging HTTP v1 using RSA-SHA256
 */
async function getGoogleOAuth2Token(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);

    // Return cached token if valid for at least 5 more minutes
    if (cachedOAuthToken && tokenExpiry > now + 300) {
        return cachedOAuthToken;
    }

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claimSet = Buffer.from(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    })).toString('base64url');

    const signature = crypto.createSign('RSA-SHA256')
        .update(`${header}.${claimSet}`)
        .sign(serviceAccount.private_key, 'base64url');

    const jwtAssertion = `${header}.${claimSet}.${signature}`;
    const postBody = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtAssertion
    }).toString();

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postBody)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        cachedOAuthToken = parsed.access_token;
                        tokenExpiry = now + (parsed.expires_in || 3600);
                        resolve(cachedOAuthToken);
                    } else {
                        reject(new Error(parsed.error_description || 'Failed to obtain access token'));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', reject);
        req.write(postBody);
        req.end();
    });
}

/**
 * Sends a single message using FCM HTTP v1 API
 */
function sendV1Message(projectId, accessToken, token, notification) {
    const { title, message, category, target, _id } = notification;

    const payload = JSON.stringify({
        message: {
            token: token,
            notification: {
                title: title,
                body: message
            },
            android: {
                priority: 'HIGH',
                notification: {
                    channel_id: 'navonmesh_alerts',
                    default_sound: true,
                    default_vibrate_timings: true,
                    notification_priority: 'PRIORITY_MAX',
                    visibility: 'PUBLIC',
                    icon: 'ic_launcher',
                    color: '#0284c7'
                }
            },
            data: {
                notificationId: _id ? _id.toString() : Date.now().toString(),
                category: category || 'announcement',
                target: target || 'all',
                title: title,
                message: message
            }
        }
    });

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'fcm.googleapis.com',
            path: `/v1/projects/${projectId}/messages:send`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                const ok = res.statusCode >= 200 && res.statusCode < 300;
                resolve({ success: ok, response: data });
            });
        });

        req.on('error', (err) => resolve({ success: false, error: err.message }));
        req.write(payload);
        req.end();
    });
}

/**
 * Main FCM Broadcast Function:
 * Automatically uses FCM HTTP V1 if service account is available,
 * or Legacy FCM if FCM_SERVER_KEY is provided.
 */
async function sendFcmBroadcast(notification) {
    try {
        const { target, title } = notification;

        // 1. Fetch active device tokens matching target
        let query = {};
        if (target && target !== 'all') {
            query = { role: { $in: ['all', target.toLowerCase()] } };
        }

        const deviceTokens = await DeviceToken.find(query).select('token').lean();
        const tokens = deviceTokens.map(d => d.token).filter(Boolean);

        if (tokens.length === 0) {
            console.log('[FCM] No registered device tokens found for target:', target);
            return { success: false, message: 'No registered device tokens' };
        }

        console.log(`[FCM] Dispatching push notification to ${tokens.length} device(s) for "${title}"`);

        // Check for FCM HTTP v1 Service Account
        const serviceAccount = loadServiceAccount();
        if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
            console.log(`[FCM v1] Sending via Firebase Cloud Messaging V1 (Project: ${serviceAccount.project_id})`);
            const accessToken = await getGoogleOAuth2Token(serviceAccount);
            const results = await Promise.all(tokens.map(tok => sendV1Message(serviceAccount.project_id, accessToken, tok, notification)));
            const successful = results.filter(r => r.success).length;
            console.log(`[FCM v1 Results] Successfully sent to ${successful}/${tokens.length} devices`);
            return { success: true, count: successful, total: tokens.length };
        }

        // Check for Legacy FCM Server Key
        const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
        if (fcmServerKey) {
            console.log('[FCM Legacy] Sending via Legacy Cloud Messaging API');
            const payload = JSON.stringify({
                registration_ids: tokens,
                priority: 'high',
                notification: {
                    title: notification.title,
                    body: notification.message,
                    channel_id: 'navonmesh_alerts',
                    sound: 'default',
                    icon: 'ic_launcher',
                    color: '#0284c7'
                },
                data: {
                    notificationId: notification._id ? notification._id.toString() : Date.now().toString(),
                    category: notification.category || 'announcement',
                    target: notification.target || 'all',
                    title: notification.title,
                    message: notification.message
                }
            });

            return new Promise((resolve) => {
                const req = https.request({
                    hostname: 'fcm.googleapis.com',
                    path: '/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `key=${fcmServerKey}`,
                        'Content-Length': Buffer.byteLength(payload)
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => { data += chunk; });
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            console.log('[FCM Legacy Result] Success:', parsed.success, 'Failure:', parsed.failure);
                            resolve({ success: true, result: parsed });
                        } catch (e) {
                            resolve({ success: false, raw: data });
                        }
                    });
                });

                req.on('error', (err) => resolve({ success: false, error: err.message }));
                req.write(payload);
                req.end();
            });
        }

        console.log('[FCM Setup Needed] No Firebase Service Account JSON or FCM_SERVER_KEY found.');
        return { success: false, message: 'Firebase credentials not configured' };

    } catch (err) {
        console.error('[FCM Exception]', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendFcmBroadcast
};
