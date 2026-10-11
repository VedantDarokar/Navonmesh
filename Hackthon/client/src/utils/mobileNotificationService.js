import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getApiUrl } from './apiConfig';

const HIGH_PRIORITY_CHANNEL_ID = 'navonmesh_alerts';

/**
 * Creates high-priority notification channels in Android.
 * Setting importance = 5 ensures heads-up popup banner appearance on mobile home screen & over apps.
 */
export async function setupNotificationChannels() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await LocalNotifications.createChannel({
            id: HIGH_PRIORITY_CHANNEL_ID,
            name: 'Navonmesh Live Alerts & Broadcasts',
            description: 'Heads-up popups for rounds, meal queues, duty rosters, and emergency announcements',
            importance: 5, // 5 = IMPORTANCE_HIGH (Triggers Heads-Up Floating Popup on Android)
            visibility: 1, // 1 = VISIBILITY_PUBLIC (Shows on Lock Screen)
            sound: 'beep.wav',
            vibration: true,
            lights: true,
            lightColor: '#0284c7'
        });
        console.log('[NotificationService] Android Heads-Up notification channel configured.');
    } catch (err) {
        console.warn('[NotificationService] Could not configure notification channel:', err);
    }
}

/**
 * Registers device FCM token with backend server
 */
async function sendTokenToBackend(fcmToken, userRole = 'coordinator', userId = '') {
    try {
        const API_URL = getApiUrl();
        await fetch(`${API_URL}/api/notifications/register-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: fcmToken,
                role: userRole,
                userId: userId || localStorage.getItem('coor_user_id') || localStorage.getItem('team_id') || 'guest',
                platform: Capacitor.getPlatform()
            })
        });
        console.log('[NotificationService] Registered FCM device token with backend successfully.');
    } catch (err) {
        console.warn('[NotificationService] Failed to register token with backend:', err);
    }
}

/**
 * Initializes native Android Push Notifications (FCM) & Local Heads-Up Channels
 */
export async function initMobileNotifications({ userRole = 'coordinator', userId = '', onReceived, onClicked } = {}) {
    // 1. Web Browser Fallback
    if (!Capacitor.isNativePlatform()) {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (e) {}
        }
        return;
    }

    try {
        // 2. Configure Android Heads-Up Channel
        await setupNotificationChannels();

        // 3. Request Local & Push notification permissions
        let localPerm = await LocalNotifications.requestPermissions();
        let pushPerm = await PushNotifications.requestPermissions();

        console.log('[NotificationService] Permissions:', { local: localPerm.display, push: pushPerm.receive });

        if (pushPerm.receive === 'granted') {
            // Register with Google Play Services / FCM
            await PushNotifications.register();
        }

        // Listen for successful token registration
        PushNotifications.removeAllListeners();

        PushNotifications.addListener('registration', async (token) => {
            console.log('[NotificationService] Device Push Token received:', token.value);
            localStorage.setItem('navonmesh_fcm_token', token.value);
            await sendTokenToBackend(token.value, userRole, userId);
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.warn('[NotificationService] FCM Registration error:', error);
        });

        // Heads-up popup when notification arrives in foreground
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('[NotificationService] Push notification received in app:', notification);
            
            // Trigger heads-up popup banner locally
            await showLocalHeadsUpNotification({
                title: notification.title || 'Navonmesh Alert',
                body: notification.body || '',
                id: Date.now() % 100000,
                extra: notification.data
            });

            if (onReceived) onReceived(notification);
        });

        // Action when user taps the popup banner on their home screen or status bar
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('[NotificationService] User tapped notification banner:', action);
            if (onClicked) onClicked(action.notification);
        });

    } catch (err) {
        console.warn('[NotificationService] Mobile notification initialization failed:', err);
    }
}

/**
 * Triggers a native Android Heads-Up Popup notification
 * (Drops down from top of screen over whatever app/home screen is open)
 */
export async function showLocalHeadsUpNotification({ title, body, id = null, extra = {} }) {
    if (Capacitor.isNativePlatform()) {
        try {
            await setupNotificationChannels();
            const notifId = id || (Date.now() % 100000);

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: title,
                        body: body,
                        id: notifId,
                        channelId: HIGH_PRIORITY_CHANNEL_ID,
                        sound: 'beep.wav',
                        smallIcon: 'ic_launcher',
                        largeIcon: 'ic_launcher',
                        extra: extra,
                        schedule: { at: new Date(Date.now() + 100) } // instant
                    }
                ]
            });
            return;
        } catch (err) {
            console.warn('[NotificationService] LocalNotifications schedule failed:', err);
        }
    }

    // Web fallback
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: '/navonmesh_official_logo.png'
            });
        } catch (e) {}
    }
}
