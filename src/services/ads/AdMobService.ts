/**
 * AdMob Service - Banner Ads for Free Users
 * 
 * Setup Instructions:
 * 1. Create AdMob account at https://admob.google.com
 * 2. Create an app and get your App ID
 * 3. Create ad units (Banner) and get Unit IDs
 * 4. Replace the test IDs below with your real IDs
 */

import { Platform } from 'react-native';

// Test Ad IDs (use these during development)
// Replace with your real IDs before publishing!
export const AD_CONFIG = {
    // App IDs (from AdMob console)
    appId: {
        android: 'ca-app-pub-7376661656023041~9404233139', // YOUR REAL ID
        ios: 'ca-app-pub-7376661656023041~9404233139',     // YOUR REAL ID
    },

    // Banner Ad Unit IDs
    banner: {
        android: 'ca-app-pub-7376661656023041/2930308212', // YOUR REAL BANNER ID
        ios: 'ca-app-pub-7376661656023041/2930308212',     // YOUR REAL BANNER ID
    },

    // Interstitial Ad Unit IDs (optional - for between screens)
    interstitial: {
        android: 'ca-app-pub-3940256099942544/1033173712', // Test ID
        ios: 'ca-app-pub-3940256099942544/4411468910',     // Test ID
    },
};

// Get platform-specific ad unit ID
export function getBannerAdUnitId(): string {
    return Platform.select({
        android: AD_CONFIG.banner.android,
        ios: AD_CONFIG.banner.ios,
        default: AD_CONFIG.banner.android,
    }) || AD_CONFIG.banner.android;
}

export function getInterstitialAdUnitId(): string {
    return Platform.select({
        android: AD_CONFIG.interstitial.android,
        ios: AD_CONFIG.interstitial.ios,
        default: AD_CONFIG.interstitial.android,
    }) || AD_CONFIG.interstitial.android;
}

// Ad request configuration
export const adRequestConfig = {
    requestNonPersonalizedAdsOnly: true, // GDPR compliance
    keywords: ['food', 'cooking', 'recipes', 'meal planning', 'kitchen'],
};

/**
 * IMPORTANT: Before publishing to Play Store:
 * 
 * 1. Go to https://admob.google.com
 * 2. Create an account (use same Google account as Play Console)
 * 3. Add your app: Apps → Add App → Android
 * 4. Create ad units: Apps → [Your App] → Ad units → Add ad unit → Banner
 * 5. Copy your real App ID and Ad Unit IDs
 * 6. Replace the test IDs above with your real IDs
 * 7. Add your AdMob App ID to app.json (see below)
 * 
 * In app.json, add:
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "react-native-google-mobile-ads",
 *         {
 *           "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
 *           "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
 *         }
 *       ]
 *     ]
 *   }
 * }
 */
