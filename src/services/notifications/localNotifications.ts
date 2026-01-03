/**
 * Local Notification Service
 * Uses expo-notifications for offline-first local notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Notification } from '../../database/schema';

// Configure notification handling
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
        return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
    notification: Notification
): Promise<string> {
    const trigger = new Date(notification.scheduled_at);

    // If scheduled time is in the past, show immediately
    const now = new Date();
    const delay = Math.max(0, (trigger.getTime() - now.getTime()) / 1000);

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: notification.title,
            body: notification.body,
            data: {
                notificationId: notification.id,
                type: notification.type,
                ...notification.data,
            },
            sound: notification.is_critical ? 'default' : undefined,
            priority: notification.is_critical
                ? Notifications.AndroidNotificationPriority.HIGH
                : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
    });

    return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Schedule system check after hours of inactivity
 */
export async function scheduleSystemCheck(
    lastMealTime: Date,
    hoursThreshold: number = 5
): Promise<string | null> {
    const checkTime = new Date(lastMealTime);
    checkTime.setHours(checkTime.getHours() + hoursThreshold);

    // Don't schedule if already passed
    if (checkTime < new Date()) {
        return null;
    }

    const notification: Notification = {
        id: `system_check_${Date.now()}`,
        user_id: '',
        type: 'system_check',
        title: '🧠 Cognitive Load Alert',
        body: `${hoursThreshold} hours since last refuel. Your brain needs fuel to maintain peak performance.`,
        data: {},
        scheduled_at: checkTime,
        sent_at: null,
        read_at: null,
        dismissed_at: null,
        acted_upon: false,
        suppress_until: null,
        max_per_day: 3,
        times_shown_today: 0,
        is_critical: true,
        is_persistent: true,
        created_at: new Date(),
    };

    return scheduleLocalNotification(notification);
}

/**
 * Setup notification channels (Android)
 */
export async function setupNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('critical', {
            name: 'Critical Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
        });

        await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Gentle Reminders',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('tips', {
            name: 'Tips & Updates',
            importance: Notifications.AndroidImportance.LOW,
        });
    }
}
