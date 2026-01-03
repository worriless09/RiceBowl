/**
 * Bowl State Management Hook - 4 Distinct States
 * FULL (0-2hrs), GOOD (2-4hrs), LOW (4-6hrs), CRITICAL (6+hrs)
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BowlState, BowlStatus } from '../../database/schema';
import { bowlStates, colors } from '../../config/theme';

const BOWL_STORAGE_KEY = '@ricebowl/bowl_state';
const UPDATE_INTERVAL_MS = 60000; // Update every minute

interface BowlStorageData {
    lastFilledAt: string;
    lastState: BowlState;
}

// Extended state type for 4 states
export type ExtendedBowlState = 'full' | 'good' | 'low' | 'critical';

export interface ExtendedBowlStatus {
    state: ExtendedBowlState;
    percentage: number;
    lastFilledAt: Date | null;
    hoursSinceMeal: number;
    minutesSinceMeal: number;
    color: string;
    isSteaming: boolean;
    isTrembling: boolean;
    isPulsing: boolean;
    message: string;
    animationType: 'steaming' | 'calm' | 'tremble' | 'pulse';
}

/**
 * Calculate bowl state based on time since last meal
 * 4 distinct states as per new design
 */
function calculateBowlState(hoursSinceMeal: number): {
    state: ExtendedBowlState;
    percentage: number;
} {
    if (hoursSinceMeal <= 2) {
        // FULL: 0-2 hours (100% -> 75%)
        const percentage = 100 - (hoursSinceMeal / 2) * 25;
        return { state: 'full', percentage };
    } else if (hoursSinceMeal <= 4) {
        // GOOD: 2-4 hours (75% -> 50%)
        const percentage = 75 - ((hoursSinceMeal - 2) / 2) * 25;
        return { state: 'good', percentage };
    } else if (hoursSinceMeal <= 6) {
        // LOW: 4-6 hours (50% -> 20%)
        const percentage = 50 - ((hoursSinceMeal - 4) / 2) * 30;
        return { state: 'low', percentage };
    } else {
        // CRITICAL: 6+ hours (20% -> 0%)
        const percentage = Math.max(0, 20 - ((hoursSinceMeal - 6) / 2) * 20);
        return { state: 'critical', percentage };
    }
}

/**
 * Get bowl color based on state
 */
function getBowlColor(state: ExtendedBowlState): string {
    switch (state) {
        case 'full':
            return colors.bowl.full;
        case 'good':
            return colors.bowl.good;
        case 'low':
            return colors.bowl.low;
        case 'critical':
            return colors.bowl.critical;
        default:
            return colors.bowl.low;
    }
}

/**
 * Get message based on state
 */
function getBowlMessage(state: ExtendedBowlState): string {
    switch (state) {
        case 'full':
            return bowlStates.full.message;
        case 'good':
            return bowlStates.good.message;
        case 'low':
            return bowlStates.low.message;
        case 'critical':
            return bowlStates.critical.message;
        default:
            return 'Ready to monitor your system.';
    }
}

/**
 * Format time since meal
 */
export function formatTimeSince(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) {
        return `${m}m ago`;
    }
    return `${h}h ${m}m ago`;
}

/**
 * Main hook for bowl state management
 */
export function useBowlState() {
    const [status, setStatus] = useState<ExtendedBowlStatus>({
        state: 'low',
        percentage: 0,
        lastFilledAt: null,
        hoursSinceMeal: 0,
        minutesSinceMeal: 0,
        color: colors.bowl.low,
        isSteaming: false,
        isTrembling: false,
        isPulsing: false,
        message: 'Ready to monitor your system.',
        animationType: 'calm',
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load stored state
    useEffect(() => {
        loadBowlState();
    }, []);

    // Update timer
    useEffect(() => {
        const interval = setInterval(() => {
            if (status.lastFilledAt) {
                updateBowlStatus(status.lastFilledAt);
            }
        }, UPDATE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [status.lastFilledAt]);

    const loadBowlState = async () => {
        try {
            const stored = await AsyncStorage.getItem(BOWL_STORAGE_KEY);

            if (stored) {
                const data: BowlStorageData = JSON.parse(stored);
                updateBowlStatus(new Date(data.lastFilledAt));
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error loading bowl state:', error);
            setIsLoading(false);
        }
    };

    const updateBowlStatus = (lastFilledAt: Date) => {
        const now = new Date();
        const hoursSinceMeal = (now.getTime() - lastFilledAt.getTime()) / (1000 * 60 * 60);
        const minutesSinceMeal = (now.getTime() - lastFilledAt.getTime()) / (1000 * 60);

        const { state, percentage } = calculateBowlState(hoursSinceMeal);
        const color = getBowlColor(state);
        const message = getBowlMessage(state);

        // Determine animation type
        const isSteaming = state === 'full';
        const isTrembling = state === 'low';
        const isPulsing = state === 'critical';

        let animationType: 'steaming' | 'calm' | 'tremble' | 'pulse' = 'calm';
        if (isSteaming) animationType = 'steaming';
        else if (isTrembling) animationType = 'tremble';
        else if (isPulsing) animationType = 'pulse';

        setStatus({
            state,
            percentage,
            lastFilledAt,
            hoursSinceMeal,
            minutesSinceMeal,
            color,
            isSteaming,
            isTrembling,
            isPulsing,
            message,
            animationType,
        });
        setIsLoading(false);
    };

    const refillBowl = useCallback(async () => {
        const now = new Date();

        const data: BowlStorageData = {
            lastFilledAt: now.toISOString(),
            lastState: 'full',
        };

        await AsyncStorage.setItem(BOWL_STORAGE_KEY, JSON.stringify(data));
        updateBowlStatus(now);
    }, []);

    const resetBowl = useCallback(async () => {
        await AsyncStorage.removeItem(BOWL_STORAGE_KEY);
        setStatus({
            state: 'low',
            percentage: 0,
            lastFilledAt: null,
            hoursSinceMeal: 0,
            minutesSinceMeal: 0,
            color: colors.bowl.low,
            isSteaming: false,
            isTrembling: false,
            isPulsing: false,
            message: 'Ready to monitor your system.',
            animationType: 'calm',
        });
    }, []);

    return {
        status,
        isLoading,
        refillBowl,
        resetBowl,
        formatTimeSince,
    };
}
