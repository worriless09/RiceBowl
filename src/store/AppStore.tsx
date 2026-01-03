/**
 * App Store - Global State Management
 * Centralized state with AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/auth/AuthService';

// Types
export interface PantryItem {
    id: string;
    name: string;
    quantity: string;
    icon: string;
    status: 'good' | 'low' | 'expiring' | 'empty';
    daysLeft: number | null;
    addedAt: string;
}

export interface Meal {
    id: string;
    time: string;
    label: string;
    name: string;
    duration: number;
    hasRiceRule: boolean;
    isCooked: boolean;
    note?: string;
}

export interface Alert {
    id: string;
    type: 'HARD_STOP' | 'SAVE_TOMORROW' | 'BIO_RHYTHM';
    icon: string;
    title: string;
    message: string;
    actionLabel: string;
    isUrgent: boolean;
    isDismissed: boolean;
    time?: string;
}

export interface UserStats {
    streak: number;
    totalRefills: number;
    systemUptime: number;
    avgInterval: number;
    weeklyData: { day: string; refills: number }[];
}

export interface AppState {
    // User preferences
    riceMode: boolean;
    notificationsEnabled: boolean;
    isPremium: boolean;

    // Pantry
    pantryItems: PantryItem[];

    // Today's plan
    meals: Meal[];
    alerts: Alert[];

    // Stats
    stats: UserStats;
    lastRefillAt: string | null;

    // Bowl state
    bowlPercentage: number;
    bowlState: 'full' | 'good' | 'low' | 'critical';

    // Custom recipes (premium)
    customRecipes: CustomRecipe[];

    // User authentication
    user: User | null;
}

export interface CustomRecipe {
    id: string;
    name: string;
    prep_time: number;
    servings: number;
    ingredients: string[];
    instructions: string;
    tags: string[];
    createdAt: string;
}

interface AppContextType {
    state: AppState;
    loading: boolean;

    // Actions
    toggleRiceMode: () => void;
    toggleNotifications: () => void;

    // Pantry actions
    addPantryItem: (item: Omit<PantryItem, 'id' | 'addedAt'>) => void;
    updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
    removePantryItem: (id: string) => void;

    // Meal actions
    markMealCooked: (id: string) => void;
    resetMeals: () => void;

    // Alert actions
    dismissAlert: (id: string) => void;

    // Bowl actions
    refillBowl: () => void;

    // Premium
    setPremium: (value: boolean) => void;

    // Custom recipes
    addCustomRecipe: (recipe: Omit<CustomRecipe, 'id' | 'createdAt'>) => void;
    removeCustomRecipe: (id: string) => void;

    // User
    setUser: (user: User | null) => void;
}

const defaultState: AppState = {
    riceMode: true,
    notificationsEnabled: true,
    isPremium: false,

    pantryItems: [
        { id: 'p1', name: 'Rice', quantity: '2 kg', status: 'good', daysLeft: null, icon: '🍚', addedAt: new Date().toISOString() },
        { id: 'p2', name: 'Eggs', quantity: '0', status: 'empty', daysLeft: null, icon: '🥚', addedAt: new Date().toISOString() },
        { id: 'p3', name: 'Onions', quantity: '500g', status: 'low', daysLeft: 5, icon: '🧅', addedAt: new Date().toISOString() },
        { id: 'p4', name: 'Tomatoes', quantity: '4 pcs', status: 'expiring', daysLeft: 2, icon: '🍅', addedAt: new Date().toISOString() },
        { id: 'p5', name: 'Dal (Moong)', quantity: '1 kg', status: 'good', daysLeft: null, icon: '🫘', addedAt: new Date().toISOString() },
        { id: 'p6', name: 'Potatoes', quantity: '1 kg', status: 'good', daysLeft: 14, icon: '🥔', addedAt: new Date().toISOString() },
        { id: 'p7', name: 'Milk', quantity: '500ml', status: 'expiring', daysLeft: 1, icon: '🥛', addedAt: new Date().toISOString() },
        { id: 'p8', name: 'Bread', quantity: '1 pack', status: 'good', daysLeft: 4, icon: '🍞', addedAt: new Date().toISOString() },
    ],

    meals: [
        { id: 'm1', time: '8:30 AM', label: 'BREAKFAST', name: 'Poha with Tea', duration: 10, hasRiceRule: false, isCooked: false },
        { id: 'm2', time: '1:30 PM', label: 'LUNCH', name: 'Dal Bhat & Aloo Fry', duration: 30, hasRiceRule: true, isCooked: false },
        { id: 'm3', time: '9:00 PM', label: 'DINNER', name: 'Egg Curry (Cook Extra!)', duration: 25, hasRiceRule: false, isCooked: false, note: 'Cook Extra!' },
    ],

    alerts: [
        {
            id: 'soak1',
            type: 'HARD_STOP',
            icon: '⏰',
            title: 'HARD STOP',
            message: "Put the Rajma in water NOW. If you forget, don't cry to me when it's hard as a rock tomorrow.",
            actionLabel: 'Done',
            isUrgent: true,
            isDismissed: false,
        },
        {
            id: 'grocery1',
            type: 'SAVE_TOMORROW',
            icon: '🛒',
            title: 'OPERATION: SAVE TOMORROW',
            message: "You have 0 eggs. Unless you plan to eat air for breakfast, go to the shop.",
            actionLabel: 'View List',
            isUrgent: false,
            isDismissed: false,
        },
    ],

    stats: {
        streak: 4,
        totalRefills: 87,
        systemUptime: 95,
        avgInterval: 5.2,
        weeklyData: [
            { day: 'Mon', refills: 3 },
            { day: 'Tue', refills: 4 },
            { day: 'Wed', refills: 3 },
            { day: 'Thu', refills: 2 },
            { day: 'Fri', refills: 4 },
            { day: 'Sat', refills: 3 },
            { day: 'Sun', refills: 3 },
        ],
    },

    lastRefillAt: null,
    bowlPercentage: 50,
    bowlState: 'good',

    customRecipes: [],

    user: null,
};

const STORAGE_KEY = '@ricebowl/app_state';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(defaultState);
    const [loading, setLoading] = useState(true);

    // Load state from storage
    useEffect(() => {
        loadState();
    }, []);

    // Save state to storage whenever it changes
    useEffect(() => {
        if (!loading) {
            saveState();
        }
    }, [state, loading]);

    const loadState = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setState({ ...defaultState, ...parsed });
            }
        } catch (error) {
            console.error('Error loading state:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveState = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    // Actions
    const toggleRiceMode = useCallback(() => {
        setState(prev => ({ ...prev, riceMode: !prev.riceMode }));
    }, []);

    const toggleNotifications = useCallback(() => {
        setState(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    }, []);

    const addPantryItem = useCallback((item: Omit<PantryItem, 'id' | 'addedAt'>) => {
        const newItem: PantryItem = {
            ...item,
            id: `p${Date.now()}`,
            addedAt: new Date().toISOString(),
        };
        setState(prev => ({
            ...prev,
            pantryItems: [...prev.pantryItems, newItem],
        }));
    }, []);

    const updatePantryItem = useCallback((id: string, updates: Partial<PantryItem>) => {
        setState(prev => ({
            ...prev,
            pantryItems: prev.pantryItems.map(item =>
                item.id === id ? { ...item, ...updates } : item
            ),
        }));
    }, []);

    const removePantryItem = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            pantryItems: prev.pantryItems.filter(item => item.id !== id),
        }));
    }, []);

    const markMealCooked = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            meals: prev.meals.map(meal =>
                meal.id === id ? { ...meal, isCooked: true } : meal
            ),
            stats: {
                ...prev.stats,
                totalRefills: prev.stats.totalRefills + 1,
            },
            lastRefillAt: new Date().toISOString(),
            bowlPercentage: 100,
            bowlState: 'full',
        }));
    }, []);

    const resetMeals = useCallback(() => {
        setState(prev => ({
            ...prev,
            meals: prev.meals.map(meal => ({ ...meal, isCooked: false })),
        }));
    }, []);

    const dismissAlert = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            alerts: prev.alerts.map(alert =>
                alert.id === id ? { ...alert, isDismissed: true } : alert
            ),
        }));
    }, []);

    const refillBowl = useCallback(() => {
        setState(prev => ({
            ...prev,
            lastRefillAt: new Date().toISOString(),
            bowlPercentage: 100,
            bowlState: 'full',
            stats: {
                ...prev.stats,
                totalRefills: prev.stats.totalRefills + 1,
                streak: prev.stats.streak + 1,
            },
        }));
    }, []);

    const setPremium = useCallback((value: boolean) => {
        setState(prev => ({ ...prev, isPremium: value }));
    }, []);

    const addCustomRecipe = useCallback((recipe: Omit<CustomRecipe, 'id' | 'createdAt'>) => {
        const newRecipe: CustomRecipe = {
            ...recipe,
            id: `custom_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setState(prev => ({
            ...prev,
            customRecipes: [...prev.customRecipes, newRecipe],
        }));
    }, []);

    const removeCustomRecipe = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            customRecipes: prev.customRecipes.filter(r => r.id !== id),
        }));
    }, []);

    const setUser = useCallback((user: User | null) => {
        setState(prev => ({ ...prev, user }));
    }, []);

    return (
        <AppContext.Provider
            value={{
                state,
                loading,
                toggleRiceMode,
                toggleNotifications,
                addPantryItem,
                updatePantryItem,
                removePantryItem,
                markMealCooked,
                resetMeals,
                dismissAlert,
                refillBowl,
                setPremium,
                addCustomRecipe,
                removeCustomRecipe,
                setUser,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppState must be used within AppProvider');
    }
    return context;
}
