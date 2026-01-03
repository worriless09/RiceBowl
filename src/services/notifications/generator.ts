/**
 * Notification Generator & Scheduler
 */

import { Notification, NotificationType } from '../../database/schema';
import { notificationTemplates, fillTemplate, getRandomCopy } from './templates';

interface NotificationData {
    ingredient?: string;
    hours?: number;
    meal?: string;
    time?: string;
    items?: string;
    itemCount?: number;
    streakCount?: number;
    savedTime?: number;
    bowlState?: string;
    lockedRecipe?: string;
}

/**
 * Generate a notification with the appropriate template
 */
export function generateNotification(
    type: NotificationType,
    data: NotificationData
): Notification {
    const template = notificationTemplates[type];
    const bodyTemplate = getRandomCopy(type);

    const body = fillTemplate(bodyTemplate, data as Record<string, string | number>);

    const now = new Date();

    return {
        id: `notif_${type}_${now.getTime()}`,
        user_id: '', // Will be set by caller
        type,
        title: template.title,
        body,
        data: data as Record<string, unknown>,
        scheduled_at: now,
        sent_at: null,
        read_at: null,
        dismissed_at: null,
        acted_upon: false,
        suppress_until: null,
        max_per_day: template.maxPerDay,
        times_shown_today: 0,
        is_critical: template.priority === 'critical',
        is_persistent: !template.suppressible,
        created_at: now,
    };
}

/**
 * Schedule notification for a specific time
 */
export function scheduleNotification(
    type: NotificationType,
    data: NotificationData,
    scheduledTime: Date
): Notification {
    const notification = generateNotification(type, data);
    notification.scheduled_at = scheduledTime;
    return notification;
}

/**
 * Check if notification should be suppressed
 */
export function shouldSuppress(
    notification: Notification,
    recentNotifications: Notification[]
): { suppress: boolean; reason: string } {
    const template = notificationTemplates[notification.type];

    // Check daily limit
    const todayCount = recentNotifications.filter(n =>
        n.type === notification.type &&
        isSameDay(new Date(n.scheduled_at), new Date(notification.scheduled_at))
    ).length;

    if (todayCount >= template.maxPerDay) {
        return {
            suppress: true,
            reason: `Daily limit reached (${template.maxPerDay}/day)`,
        };
    }

    // Check suppress_until
    if (notification.suppress_until && new Date() < notification.suppress_until) {
        return {
            suppress: true,
            reason: 'User snoozed this notification',
        };
    }

    // Critical notifications are never suppressed
    if (notification.is_critical) {
        return { suppress: false, reason: '' };
    }

    return { suppress: false, reason: '' };
}

/**
 * Get notifications due now
 */
export function getDueNotifications(
    notifications: Notification[],
    currentTime: Date
): Notification[] {
    return notifications.filter(n => {
        if (n.sent_at !== null) return false;
        if (n.dismissed_at !== null) return false;
        return new Date(n.scheduled_at) <= currentTime;
    });
}

/**
 * Schedule daily notifications based on user preferences
 */
export function scheduleDailyNotifications(
    userId: string,
    currentDate: Date
): Notification[] {
    const notifications: Notification[] = [];

    // 6 PM - Grocery Scan
    const groceryTime = new Date(currentDate);
    groceryTime.setHours(18, 0, 0, 0);
    notifications.push(scheduleNotification('grocery_scan', {
        items: 'checking pantry...',
        itemCount: 0,
    }, groceryTime));

    // 4 PM - Tea Time
    const teaTime = new Date(currentDate);
    teaTime.setHours(16, 0, 0, 0);
    notifications.push(scheduleNotification('tea_time', {}, teaTime));

    // Set user IDs
    notifications.forEach(n => n.user_id = userId);

    return notifications;
}

// Helper
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}
