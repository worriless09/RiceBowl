/**
 * UPI Payment Screen
 * Allows users to pay via UPI and submit transaction ID for verification
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../config/theme';

// ========================================
// YOUR UPI PAYMENT DETAILS
// ========================================
const UPI_CONFIG = {
    upiId: 'asarpana918@okicici', // Your GPay UPI ID
    payeeName: 'RiceBowl Pro',
    amount: '299',
    transactionNote: 'RiceBowl Pro Lifetime',
    // WhatsApp number for support (with country code, no +)
    whatsappNumber: '919883536592',
};

// Set to true for production release (disables auto-approval)
const IS_PRODUCTION = false;

// Storage key for pending verifications
const PENDING_PAYMENTS_KEY = '@ricebowl/pending_payments';

interface UPIPaymentProps {
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export function UPIPayment({ onClose, onPaymentSuccess }: UPIPaymentProps) {
    const [step, setStep] = useState<'pay' | 'verify'>('pay');
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Generate UPI deep link
    const generateUPILink = () => {
        const { upiId, payeeName, amount, transactionNote } = UPI_CONFIG;
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        return upiUrl;
    };

    // Open UPI app
    const handlePayViaUPI = async () => {
        const upiUrl = generateUPILink();

        try {
            const canOpen = await Linking.canOpenURL(upiUrl);
            if (canOpen) {
                await Linking.openURL(upiUrl);
                // Move to verification step after opening UPI app
                setTimeout(() => setStep('verify'), 1000);
            } else {
                Alert.alert(
                    'No UPI App Found',
                    'Please install Google Pay, PhonePe, or Paytm to make payment.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Could not open UPI app. Please try again.');
        }
    };

    // Open WhatsApp with payment details
    const openWhatsAppSupport = () => {
        const message = `Hi! I just paid ₹${UPI_CONFIG.amount} for RiceBowl Pro.\n\nTransaction ID: ${transactionId}`;
        Linking.openURL(`whatsapp://send?phone=${UPI_CONFIG.whatsappNumber}&text=${encodeURIComponent(message)}`);
    };

    // Submit transaction ID for verification
    const handleSubmitTransaction = async () => {
        if (!transactionId.trim()) {
            Alert.alert('Required', 'Please enter the UPI Transaction ID');
            return;
        }

        if (transactionId.trim().length < 8) {
            Alert.alert('Invalid', 'Please enter a valid Transaction ID (usually 12+ characters)');
            return;
        }

        setSubmitting(true);

        try {
            // Store the pending payment for verification
            const pendingPayment = {
                transactionId: transactionId.trim(),
                amount: UPI_CONFIG.amount,
                submittedAt: new Date().toISOString(),
                status: 'pending',
            };

            // Save to local storage (you'd normally send this to a backend)
            const existingPayments = await AsyncStorage.getItem(PENDING_PAYMENTS_KEY);
            const payments = existingPayments ? JSON.parse(existingPayments) : [];
            payments.push(pendingPayment);
            await AsyncStorage.setItem(PENDING_PAYMENTS_KEY, JSON.stringify(payments));

            if (IS_PRODUCTION) {
                // Production: Manual verification required
                Alert.alert(
                    '✅ Payment Submitted!',
                    'Your payment is being verified. You will receive Pro access within 24 hours.\n\nFor instant activation, send screenshot to WhatsApp.',
                    [
                        { text: 'Open WhatsApp', onPress: openWhatsAppSupport },
                        { text: 'OK', onPress: onClose }
                    ]
                );
            } else {
                // Development: Auto-approve for testing
                Alert.alert(
                    '✅ Payment Submitted!',
                    'Your payment is being verified. You will receive Pro access within 24 hours.\n\nFor instant activation, send screenshot to WhatsApp.',
                    [
                        { text: 'Open WhatsApp', onPress: openWhatsAppSupport },
                        {
                            text: 'OK',
                            onPress: () => {
                                onPaymentSuccess(); // Auto-unlock for development testing only
                                onClose();
                            }
                        }
                    ]
                );
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {step === 'pay' ? 'Pay via UPI' : 'Verify Payment'}
                    </Text>
                </View>

                {step === 'pay' ? (
                    <>
                        {/* Amount Card */}
                        <View style={styles.amountCard}>
                            <Text style={styles.amountLabel}>Amount to Pay</Text>
                            <Text style={styles.amountValue}>₹{UPI_CONFIG.amount}</Text>
                            <Text style={styles.amountNote}>Lifetime Access • One-time Payment</Text>
                        </View>

                        {/* UPI ID Display */}
                        <View style={styles.upiIdCard}>
                            <Text style={styles.upiIdLabel}>Pay to UPI ID</Text>
                            <View style={styles.upiIdRow}>
                                <Text style={styles.upiIdValue}>{UPI_CONFIG.upiId}</Text>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => {
                                        // In production, use Clipboard API
                                        Alert.alert('Copied!', 'UPI ID copied to clipboard');
                                    }}
                                >
                                    <Text style={styles.copyText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Pay Button */}
                        <TouchableOpacity style={styles.payButton} onPress={handlePayViaUPI}>
                            <Text style={styles.payButtonText}>Pay ₹{UPI_CONFIG.amount} via UPI</Text>
                        </TouchableOpacity>

                        {/* UPI Apps */}
                        <View style={styles.upiApps}>
                            <Text style={styles.upiAppsLabel}>Works with</Text>
                            <View style={styles.upiAppsRow}>
                                <Text style={styles.upiAppIcon}>📱</Text>
                                <Text style={styles.upiAppsText}>GPay • PhonePe • Paytm • BHIM</Text>
                            </View>
                        </View>

                        {/* Already Paid */}
                        <TouchableOpacity
                            style={styles.alreadyPaid}
                            onPress={() => setStep('verify')}
                        >
                            <Text style={styles.alreadyPaidText}>Already paid? Verify payment →</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* Verification Step */}
                        <View style={styles.verifyCard}>
                            <Text style={styles.verifyIcon}>🧾</Text>
                            <Text style={styles.verifyTitle}>Enter Transaction Details</Text>
                            <Text style={styles.verifySubtitle}>
                                Find the UPI Transaction ID in your payment app's history
                            </Text>
                        </View>

                        {/* Transaction ID Input */}
                        <Text style={styles.inputLabel}>UPI Transaction ID / UTR Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 123456789012"
                            placeholderTextColor={colors.neutral.textMuted}
                            value={transactionId}
                            onChangeText={setTransactionId}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                        <Text style={styles.inputHint}>
                            Usually 12 digits, found in payment confirmation
                        </Text>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmitTransaction}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit for Verification</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setStep('pay')}
                        >
                            <Text style={styles.backButtonText}>← Back to Payment</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Trust Section */}
                <View style={styles.trustSection}>
                    <Text style={styles.trustItem}>🔒 Secure UPI Payment</Text>
                    <Text style={styles.trustItem}>✓ Instant Verification</Text>
                    <Text style={styles.trustItem}>💬 WhatsApp Support</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    closeButton: {
        padding: spacing.sm,
        marginRight: spacing.md,
    },
    closeText: {
        fontSize: 20,
        color: colors.neutral.textMuted,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    amountCard: {
        backgroundColor: colors.primary.main,
        marginHorizontal: spacing.lg,
        borderRadius: 20,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    amountLabel: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: spacing.xs,
    },
    amountValue: {
        fontSize: 48,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    amountNote: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.sm,
    },
    upiIdCard: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    upiIdLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginBottom: spacing.sm,
    },
    upiIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    upiIdValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    copyButton: {
        backgroundColor: colors.primary.light,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    copyText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
    payButton: {
        backgroundColor: '#5C4EE5',
        marginHorizontal: spacing.lg,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    payButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    upiApps: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    upiAppsLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginBottom: spacing.sm,
    },
    upiAppsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upiAppIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    upiAppsText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
    },
    alreadyPaid: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    alreadyPaidText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
    verifyCard: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 20,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    verifyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    verifyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.sm,
    },
    verifySubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        textAlign: 'center',
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.lg,
        color: colors.neutral.textPrimary,
        borderWidth: 2,
        borderColor: colors.neutral.border,
        letterSpacing: 1,
    },
    inputHint: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    submitButton: {
        backgroundColor: colors.primary.main,
        marginHorizontal: spacing.lg,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    backButtonText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: spacing.lg,
        paddingVertical: spacing['2xl'],
        paddingHorizontal: spacing.lg,
    },
    trustItem: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
    },
});
