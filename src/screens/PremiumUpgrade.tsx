/**
 * Premium Upgrade Screen
 * Shows Pro benefits and handles purchase
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { colors, spacing, typography } from '../config/theme';
import {
    getOfferings,
    purchaseProLifetime,
    restorePurchases,
    checkPremiumStatus,
} from '../services/payments/PaymentService';
import { useAppState } from '../store/AppStore';
import { UPIPayment } from './UPIPayment';

const PRO_BENEFITS = [
    { icon: '📚', title: '100+ Premium Recipes', description: 'Unlock the full library including comfort classics' },
    { icon: '✏️', title: 'Add Your Own Recipes', description: 'Save your personal recipes in "My Recipes"' },
    { icon: '🚫', title: 'No Advertisements', description: 'Zero interruptions, pure focus on food' },
    { icon: '🔍', title: 'Explore Mode', description: 'Discover new cuisines and cooking styles' },
    { icon: '📊', title: 'Advanced Analytics', description: 'Detailed meal patterns and nutrition insights' },
    { icon: '🔄', title: 'Cloud Sync', description: 'Backup and sync across all your devices' },
    { icon: '♾️', title: 'Lifetime Access', description: 'Pay once, enjoy forever. No subscriptions!' },
];

interface PremiumUpgradeProps {
    onClose?: () => void;
    onPurchaseComplete?: () => void;
}

export function PremiumUpgrade({ onClose, onPurchaseComplete }: PremiumUpgradeProps) {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState('₹299');
    const [restoring, setRestoring] = useState(false);
    const [showUPIModal, setShowUPIModal] = useState(false);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        const offerings = await getOfferings();
        if (offerings?.availablePackages?.[0]?.product?.priceString) {
            setPrice(offerings.availablePackages[0].product.priceString);
        }
    };

    // Open UPI Payment modal
    const handlePurchase = () => {
        setShowUPIModal(true);
    };

    // Called when UPI payment is successful
    const handleUPISuccess = () => {
        setShowUPIModal(false);
        Alert.alert(
            '🎉 Welcome to Pro!',
            'You now have lifetime access to all premium features. Thank you for supporting RiceBowl!',
            [{ text: 'Start Exploring', onPress: () => onPurchaseComplete?.() }]
        );
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const result = await restorePurchases();

            if (result.success) {
                Alert.alert('Purchases Restored', 'Your Pro access has been restored!', [
                    { text: 'Great!', onPress: onPurchaseComplete },
                ]);
            } else {
                Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases.');
        } finally {
            setRestoring(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.starBurst}>🌟</Text>
                    <Text style={styles.title}>Upgrade to Pro</Text>
                    <Text style={styles.subtitle}>
                        Unlock the full RiceBowl experience
                    </Text>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Lifetime Access</Text>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceAmount}>{price}</Text>
                            <Text style={styles.priceNote}>one-time payment</Text>
                        </View>
                    </View>
                    <View style={styles.savings}>
                        <Text style={styles.savingsText}>
                            💰 Save ₹3,000+/year vs. subscriptions
                        </Text>
                    </View>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsSection}>
                    <Text style={styles.benefitsTitle}>What You Get</Text>
                    {PRO_BENEFITS.map((benefit, index) => (
                        <View key={index} style={styles.benefitRow}>
                            <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                <Text style={styles.benefitDescription}>{benefit.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Purchase Button */}
                <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={handlePurchase}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.purchaseButtonText}>
                            Upgrade for {price}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Restore */}
                <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleRestore}
                    disabled={restoring}
                >
                    <Text style={styles.restoreButtonText}>
                        {restoring ? 'Restoring...' : 'Restore Purchase'}
                    </Text>
                </TouchableOpacity>

                {/* Trust Badges */}
                <View style={styles.trustSection}>
                    <Text style={styles.trustItem}>🔒 Secure UPI Payment</Text>
                    <Text style={styles.trustItem}>✓ Instant Access</Text>
                    <Text style={styles.trustItem}>💬 WhatsApp Support</Text>
                </View>

                {/* Fine Print */}
                <Text style={styles.finePrint}>
                    Pay securely via UPI (GPay, PhonePe, Paytm).
                    WhatsApp support available for any issues.
                </Text>
            </ScrollView>

            {/* UPI Payment Modal */}
            <Modal
                visible={showUPIModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowUPIModal(false)}
            >
                <UPIPayment
                    onClose={() => setShowUPIModal(false)}
                    onPaymentSuccess={handleUPISuccess}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.xl,
    },
    starBurst: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    priceCard: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 20,
        padding: spacing.xl,
        borderWidth: 2,
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    priceLabel: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    priceTag: {
        alignItems: 'flex-end',
    },
    priceAmount: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.main,
    },
    priceNote: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
    },
    savings: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: spacing.md,
        alignItems: 'center',
    },
    savingsText: {
        fontSize: typography.fontSize.sm,
        color: '#2E7D32',
        fontWeight: typography.fontWeight.medium,
    },
    benefitsSection: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing['2xl'],
    },
    benefitsTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.lg,
    },
    benefitRow: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        alignItems: 'flex-start',
    },
    benefitIcon: {
        fontSize: 28,
        marginRight: spacing.md,
        width: 40,
        textAlign: 'center',
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
        marginBottom: 2,
    },
    benefitDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    purchaseButton: {
        backgroundColor: colors.primary.main,
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    purchaseButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    restoreButton: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    restoreButtonText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.md,
        flexWrap: 'wrap',
    },
    trustItem: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
    },
    finePrint: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textDisabled,
        textAlign: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing['3xl'],
        lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
    },
});
