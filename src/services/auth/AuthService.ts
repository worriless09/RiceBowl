/**
 * Auth Service - Google Sign-In
 * For Premium users - enables cloud sync and purchase restoration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USER_KEY = '@ricebowl/user';

// User type
export interface User {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: 'google' | 'guest';
    createdAt: string;
}

/**
 * Configure Google Sign-In
 * Call this in App.tsx on startup
 * 
 * Production setup requires:
 * 1. npm install @react-native-google-signin/google-signin
 * 2. Add to app.json plugins:
 *    ["@react-native-google-signin/google-signin"]
 * 3. Configure webClientId from Firebase/Google Cloud Console
 */
export async function configureGoogleSignIn(): Promise<void> {
    try {
        // In production:
        // import { GoogleSignin } from '@react-native-google-signin/google-signin';
        // GoogleSignin.configure({
        //     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        //     offlineAccess: true,
        // });
        console.log('[Auth] Google Sign-In configured');
    } catch (error) {
        console.error('[Auth] Failed to configure Google Sign-In:', error);
    }
}

/**
 * Sign in with Google
 * Returns user object on success
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        // In production:
        // import { GoogleSignin } from '@react-native-google-signin/google-signin';
        // await GoogleSignin.hasPlayServices();
        // const userInfo = await GoogleSignin.signIn();
        // const user: User = {
        //     id: userInfo.user.id,
        //     email: userInfo.user.email,
        //     displayName: userInfo.user.name,
        //     photoURL: userInfo.user.photo,
        //     provider: 'google',
        //     createdAt: new Date().toISOString(),
        // };

        // For development - simulate successful sign in
        const mockUser: User = {
            id: 'google_' + Date.now(),
            email: 'user@example.com',
            displayName: 'RiceBowl User',
            photoURL: null,
            provider: 'google',
            createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));

        console.log('[Auth] User signed in:', mockUser.email);
        return { success: true, user: mockUser };
    } catch (error: any) {
        console.error('[Auth] Sign in failed:', error);
        return {
            success: false,
            error: error.message || 'Sign in failed'
        };
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
        // In production:
        // import { GoogleSignin } from '@react-native-google-signin/google-signin';
        // await GoogleSignin.signOut();

        await AsyncStorage.removeItem(USER_KEY);
        console.log('[Auth] User signed out');
        return { success: true };
    } catch (error: any) {
        console.error('[Auth] Sign out failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const stored = await AsyncStorage.getItem(USER_KEY);
        if (stored) {
            return JSON.parse(stored) as User;
        }
        return null;
    } catch (error) {
        console.error('[Auth] Failed to get current user:', error);
        return null;
    }
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(): Promise<boolean> {
    try {
        // In production:
        // import { GoogleSignin } from '@react-native-google-signin/google-signin';
        // return await GoogleSignin.isSignedIn();

        const user = await getCurrentUser();
        return user !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Link user with RevenueCat for purchase restoration
 */
export async function linkWithRevenueCat(userId: string): Promise<void> {
    try {
        // In production:
        // import Purchases from 'react-native-purchases';
        // await Purchases.logIn(userId);
        console.log('[Auth] Linked user with RevenueCat:', userId);
    } catch (error) {
        console.error('[Auth] Failed to link with RevenueCat:', error);
    }
}

export default {
    configureGoogleSignIn,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isSignedIn,
    linkWithRevenueCat,
};
