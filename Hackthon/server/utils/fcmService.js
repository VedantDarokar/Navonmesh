const https = require('https');
const DeviceToken = require('../models/DeviceToken');

/**
 * Dispatches Push Notifications to Android devices via Firebase Cloud Messaging (FCM)
 * This enables heads-up popup notifications on the mobile home screen even when the app is CLOSED.
 */
async function sendFcmBroadcast(notification) {
    try {
        const { target, title, message, category, _id } = notification;

        // 1. Find matching registered device tokens
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

        console.log(`[FCM] Dispatching push notification to ${tokens.length} device(s) for target "${target}"`);

        const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
        if (!fcmServerKey) {
            console.log('[FCM Notice] To enable cloud push when the app is closed, set FCM_SERVER_KEY in server/.env');
            return { success: false, message: 'FCM_SERVER_KEY not configured in .env' };
        }

        // 2. Prepare High-Priority Android Payload for Heads-Up Home Screen Popup
        const payload = JSON.stringify({
            registration_ids: tokens,
            priority: 'high',
            notification: {
                title: title,
                body: message,
                channel_id: 'navonmesh_alerts',
                sound: 'default',
                icon: 'ic_launcher',
                color: '#0284c7',
                click_action: 'FCM_PLUGIN_ACTIVITY'
            },
            data: {
                notificationId: _id ? _id.toString() : Date.now().toString(),
                category: category || 'announcement',
                target: target || 'all',
                title: title,
                message: message
            }
        });

        // 3. Send HTTP request to FCM legacy endpoint
        const options = {
            hostname: 'fcm.googleapis.com',
            path: '/fcm/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${fcmServerKey}`
            }
        };

        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => { responseData += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        console.log('[FCM Success] Sent to devices:', parsed.success, 'failures:', parsed.failure);
                        resolve({ success: true, result: parsed });
                    } catch (e) {
                        resolve({ success: false, raw: responseData });
                    }
                });
            });

            req.on('error', (err) => {
                console.warn('[FCM Error] Failed sending push request:', err.message);
                resolve({ success: false, error: err.message });
            });

            req.write(payload);
            req.end();
        });

    } catch (err) {
        console.error('[FCM Exception]', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendFcmBroadcast
};
