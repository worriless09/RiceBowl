/**
 * Payment Service - RevenueCat Integration
 * Handles ₹299 lifetime Pro purchase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat API Key (from RevenueCat dashboard)
const REVENUECAT_API_KEY_ANDROID = 'test_bijJdFLexvATJdrBSCOPdhLDsLa';
const REVENUECAT_API_KEY_IOS = 'test_bijJdFLexvATJdrBSCOPdhLDsLa';

// Product IDs (configure these in Play Store / App Store)
export const PRODUCTS = {
    PRO_LIFETIME: 'ricebowl_pro_lifetime', // ₹299 one-time purchase
};

// Storage keys
const PREMIUM_STATUS_KEY = '@ricebowl/premium_status';

export interface PurchaseResult {
    success: boolean;
    productId?: string;
    error?: string;
}

export interface PremiumStatus {
    isPremium: boolean;
    purchaseDate?: string;
    expiresDate?: string | null; // null for lifetime
}

/**
 * Initialize RevenueCat SDK
 * Call this in App.tsx on startup
 */
export async function initializePurchases(): Promise<void> {
    try {
        // In production, use:
        // import Purchases from 'react-native-purchases';
        // await Purchases.configure({ apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID });

        console.log('Purchases initialized');
    } catch (error) {
        console.error('Failed to initialize purchases:', error);
    }
}

/**
 * Get available products/offerings
 */
export async function getOfferings(): Promise<any> {
    try {
        // In production:
        // const offerings = await Purchases.getOfferings();
        // return offerings.current;

        // Mock data for development
        return {
            identifier: 'default',
            availablePackages: [
                {
                    identifier: 'lifetime',
                    product: {
                        identifier: PRODUCTS.PRO_LIFETIME,
                        title: 'RiceBowl Pro (Lifetime)',
                        description: '100+ recipes, no ads, Explore Mode, future updates',
                        priceString: '₹299',
                        price: 299,
                        currencyCode: 'INR',
                    },
                },
            ],
        };
    } catch (error) {
        console.error('Failed to get offerings:', error);
        return null;
    }
}

/**
 * Purchase Pro lifetime access
 */
export async function purchaseProLifetime(): Promise<PurchaseResult> {
    try {
        // In production:
        // const { customerInfo } = await Purchases.purchaseProduct(PRODUCTS.PRO_LIFETIME);
        // const isPremium = customerInfo.entitlements.active['pro'] !== undefined;

        // For development, simulate successful purchase
        const purchaseDate = new Date().toISOString();

        await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify({
            isPremium: true,
            purchaseDate,
            expiresDate: null, // Lifetime = never expires
        }));

        return {
            success: true,
            productId: PRODUCTS.PRO_LIFETIME,
        };
    } catch (error: any) {
        console.error('Purchase failed:', error);
        return {
            success: false,
            error: error.message || 'Purchase failed',
        };
    }
}

/**
 * Check current premium status
 */
export async function checkPremiumStatus(): Promise<PremiumStatus> {
    try {
        // First check local storage (for offline support)
        const stored = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }

        // In production, also verify with RevenueCat:
        // const customerInfo = await Purchases.getCustomerInfo();
        // const isPremium = customerInfo.entitlements.active['pro'] !== undefined;

        return {
            isPremium: false,
        };
    } catch (error) {
        console.error('Failed to check premium status:', error);
        return { isPremium: false };
    }
}

/**
 * Restore purchases (important for App Store compliance)
 */
export async function restorePurchases(): Promise<PurchaseResult> {
    try {
        // In production:
        // const customerInfo = await Purchases.restorePurchases();
        // const isPremium = customerInfo.entitlements.active['pro'] !== undefined;

        const status = await checkPremiumStatus();

        return {
            success: status.isPremium,
            productId: status.isPremium ? PRODUCTS.PRO_LIFETIME : undefined,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Restore failed',
        };
    }
}
