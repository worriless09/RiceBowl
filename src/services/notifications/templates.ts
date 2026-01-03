/**
 * Notification Templates
 * 
 * Productivity-focused copy - NO diet culture language
 * Uses: Fuel, Calibration, Cognitive Load, Maintenance
 */

import { NotificationType } from '../../database/schema';

export interface NotificationTemplate {
    type: NotificationType;
    title: string;
    bodyTemplate: string;
    priority: 'critical' | 'high' | 'normal' | 'low';
    suppressible: boolean;
    maxPerDay: number;
    soundEnabled: boolean;
}

/**
 * All 5 core notification templates
 */
export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
    // 1. Grocery Scan (6 PM)
    grocery_scan: {
        type: 'grocery_scan',
        title: '📋 Quick Supply Check',
        bodyTemplate: 'Tomorrow\'s menu needs: {{items}}. Got 15 min before the stores close?',
        priority: 'normal',
        suppressible: true,
        maxPerDay: 1,
        soundEnabled: false,
    },

    // 2. Soak Alert (Calculated timing)
    soak_alert: {
        type: 'soak_alert',
        title: '⏰ Prep Window Open',
        bodyTemplate: '{{ingredient}} needs {{hours}}h soak. Start now for {{meal}} at {{time}}.',
        priority: 'critical',
        suppressible: false, // Persistent until action
        maxPerDay: 3,
        soundEnabled: true,
    },

    // 3. Tea Time (4 PM bio-rhythm nudge)
    tea_time: {
        type: 'tea_time',
        title: '☕ System Calibration',
        bodyTemplate: 'Afternoon energy dip detected. Quick refuel: tea + light snack?',
        priority: 'low',
        suppressible: true,
        maxPerDay: 1,
        soundEnabled: false,
    },

    // 4. Premium Upsell (On locked recipe click)
    premium_upsell: {
        type: 'premium_upsell',
        title: '🌟 Unlock Full Kitchen',
        bodyTemplate: 'This week alone, Pro would have saved you {{savedTime}} min on meal planning. ₹299 lifetime.',
        priority: 'low',
        suppressible: true,
        maxPerDay: 1,
        soundEnabled: false,
    },

    // 5. Streak Share (After meal completion)
    streak_share: {
        type: 'streak_share',
        title: '🔥 Streak Milestone!',
        bodyTemplate: '{{streakCount}} days of consistent refueling! Share your achievement?',
        priority: 'normal',
        suppressible: true,
        maxPerDay: 1,
        soundEnabled: true,
    },

    // 6. System Check (5-hour idle trigger)
    system_check: {
        type: 'system_check',
        title: '🧠 Cognitive Load Alert',
        bodyTemplate: 'Your cognitive load is peaking. Refuel now to prevent a crash. Bowl status: {{bowlState}}.',
        priority: 'high',
        suppressible: false,
        maxPerDay: 3,
        soundEnabled: true,
    },
};

/**
 * Copy variations for A/B testing and personalization
 */
export const copyVariations: Record<NotificationType, string[]> = {
    grocery_scan: [
        'Tomorrow\'s menu needs: {{items}}. Got 15 min before the stores close?',
        'Missing {{itemCount}} items for tomorrow. Quick detour on the way home?',
        'Your fridge needs backup: {{items}}. Evening grocery run?',
    ],

    soak_alert: [
        '{{ingredient}} needs {{hours}}h soak. Start now for {{meal}} at {{time}}.',
        'Tonight\'s prep: {{ingredient}} → soak {{hours}}h for optimal {{meal}}.',
        'Critical prep window: {{ingredient}} must soak NOW for tomorrow\'s {{meal}}.',
    ],

    tea_time: [
        'Afternoon energy dip detected. Quick refuel: tea + light snack?',
        '4 PM slump incoming. Counter with chai + something crunchy?',
        'Brain fog warning: Your body\'s requesting a small reboot.',
    ],

    premium_upsell: [
        'This week alone, Pro would have saved you {{savedTime}} min on meal planning. ₹299 lifetime.',
        '{{lockedRecipe}} is calling. Unlock 100+ recipes for ₹299 lifetime.',
        'You\'ve hit the free tier limit 3 times this week. Pro = zero friction.',
    ],

    streak_share: [
        '{{streakCount}} days of consistent refueling! Share your achievement?',
        'You\'re on fire! 🔥 {{streakCount}}-day streak. Flex on your feed?',
        'Streak: {{streakCount}} | Status: Champion-level consistency.',
    ],

    system_check: [
        'Your cognitive load is peaking. Refuel now to prevent a crash.',
        'System Check: 5 hours since last refuel. Initiating maintenance protocol.',
        'Warning: Operating on empty. Performance degradation imminent.',
        'Your brain\'s running on reserves. Quick refuel = 2+ hours of peak focus.',
    ],
};

/**
 * Get a random copy variation
 */
export function getRandomCopy(type: NotificationType): string {
    const variations = copyVariations[type];
    const index = Math.floor(Math.random() * variations.length);
    return variations[index];
}

/**
 * Fill template with data
 */
export function fillTemplate(template: string, data: Record<string, string | number>): string {
    let result = template;

    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return result;
}
