/**
 * Soaking Calculator
 * 
 * Calculates backward from meal time to determine when to start soaking
 * Example: 8-hour soak for dinner at 8 PM → remind at noon
 */

import { MealType } from '../database/schema';

interface SoakReminderResult {
    reminderTime: string; // "HH:mm"
    startSoakingAt: Date;
    mealReadyAt: Date;
    hoursRequired: number;
    isUrgent: boolean;
    message: string;
}

// Default meal times
const DEFAULT_MEAL_TIMES: Record<MealType, string> = {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '20:00',
    snack: '16:00',
};

/**
 * Calculate when to remind user to start soaking
 */
export function calculateSoakReminder(
    soakHours: number,
    mealType: MealType,
    currentTime: string,
    customMealTime?: string
): SoakReminderResult {
    const mealTime = customMealTime || DEFAULT_MEAL_TIMES[mealType];

    // Parse times
    const [mealHour, mealMinute] = mealTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);

    // Calculate meal ready time (today or tomorrow)
    const now = new Date();
    const mealDate = new Date(now);
    mealDate.setHours(mealHour, mealMinute, 0, 0);

    // If meal time has passed today, schedule for tomorrow
    if (mealHour < currentHour || (mealHour === currentHour && mealMinute <= currentMinute)) {
        mealDate.setDate(mealDate.getDate() + 1);
    }

    // Calculate soak start time (work backward)
    const soakStartTime = new Date(mealDate);
    soakStartTime.setHours(soakStartTime.getHours() - soakHours);

    // Determine if this is urgent (less than 1 hour until needed)
    const msUntilSoak = soakStartTime.getTime() - now.getTime();
    const hoursUntilSoak = msUntilSoak / (1000 * 60 * 60);
    const isUrgent = hoursUntilSoak < 1;

    // Format reminder time
    const reminderHour = soakStartTime.getHours().toString().padStart(2, '0');
    const reminderMinute = soakStartTime.getMinutes().toString().padStart(2, '0');
    const reminderTime = `${reminderHour}:${reminderMinute}`;

    // Generate message
    let message: string;
    if (isUrgent) {
        message = `⚠️ URGENT: Start soaking NOW! You need ${soakHours} hours for ${mealType}.`;
    } else if (hoursUntilSoak < 3) {
        message = `Reminder: Start soaking in ${Math.round(hoursUntilSoak * 60)} minutes for ${mealType}.`;
    } else {
        message = `Prep ahead: Soak at ${reminderTime} for ${soakHours} hours (${mealType} ready by ${mealTime}).`;
    }

    return {
        reminderTime,
        startSoakingAt: soakStartTime,
        mealReadyAt: mealDate,
        hoursRequired: soakHours,
        isUrgent,
        message,
    };
}

/**
 * Get all soak reminders for a day's planned recipes
 */
export function getAllSoakReminders(
    recipes: Array<{ id: string; name: string; soakHours: number; soakIngredient: string; mealType: MealType }>,
    currentTime: string
): SoakReminderResult[] {
    return recipes
        .filter(r => r.soakHours > 0)
        .map(recipe => {
            const reminder = calculateSoakReminder(recipe.soakHours, recipe.mealType, currentTime);
            return {
                ...reminder,
                message: `Soak ${recipe.soakIngredient}: ${reminder.message}`,
            };
        })
        .sort((a, b) => a.startSoakingAt.getTime() - b.startSoakingAt.getTime());
}

/**
 * Check if it's too late to soak for a meal
 */
export function isTooLateToSoak(
    soakHours: number,
    mealType: MealType,
    currentTime: string
): { tooLate: boolean; alternativeMeal: MealType | null; message: string } {
    const reminder = calculateSoakReminder(soakHours, mealType, currentTime);

    const now = new Date();
    const soakStart = reminder.startSoakingAt;

    if (soakStart < now) {
        // Already too late for this meal
        const nextMeal = getNextMealType(mealType);

        return {
            tooLate: true,
            alternativeMeal: nextMeal,
            message: `Too late to soak for ${mealType}. Consider this for ${nextMeal || 'tomorrow'} instead.`,
        };
    }

    return {
        tooLate: false,
        alternativeMeal: null,
        message: reminder.message,
    };
}

/**
 * Get the next meal type in sequence
 */
function getNextMealType(current: MealType): MealType | null {
    const sequence: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
    const currentIndex = sequence.indexOf(current);

    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
        return null; // No next meal today
    }

    return sequence[currentIndex + 1];
}

/**
 * Calculate overnight soaking schedule
 */
export function calculateOvernightSoak(
    soakHours: number,
    breakfastTime: string = '08:00'
): { soakAt: string; wakeUpCheck: string; message: string } {
    // Work backward from breakfast
    const [hour, minute] = breakfastTime.split(':').map(Number);

    // Soak start time
    let soakHour = hour - soakHours;
    if (soakHour < 0) soakHour += 24; // Wrap to previous day

    const soakAt = `${soakHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Morning check (30 min before breakfast)
    const checkHour = hour > 0 ? hour - 1 : 23;
    const wakeUpCheck = `${checkHour.toString().padStart(2, '0')}:30`;

    return {
        soakAt,
        wakeUpCheck,
        message: `Soak at ${soakAt} for ${soakHours}-hour prep. Morning check: ${wakeUpCheck}`,
    };
}
