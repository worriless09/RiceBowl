/**
 * Firebase Configuration
 * SECURITY: All credentials are loaded from environment variables
 * Create a .env file with these values (never commit .env to git)
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
// For Expo, use EXPO_PUBLIC_ prefix
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Only initialize if we have required config
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase
const app = hasConfig
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
    : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { app, auth, db };
