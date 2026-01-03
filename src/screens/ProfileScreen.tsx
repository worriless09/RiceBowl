/**
 * Profile Screen - Connected to Global State
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Switch,
    Modal,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useAppState } from '../store/AppStore';
import { colors, spacing, typography } from '../config/theme';
import { PremiumUpgrade } from './PremiumUpgrade';
import { signInWithGoogle, signOut, linkWithRevenueCat } from '../services/auth/AuthService';

export function ProfileScreen() {
    const { state, toggleNotifications, toggleRiceMode, setPremium, setUser } = useAppState();
    const [showRiceInfo, setShowRiceInfo] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [signingIn, setSigningIn] = useState(false);

    const handlePurchaseComplete = () => {
        setPremium(true);
        setShowUpgradeModal(false);
    };

    const handleSignIn = async () => {
        setSigningIn(true);
        try {
            const result = await signInWithGoogle();
            if (result.success && result.user) {
                setUser(result.user);
                // Link with RevenueCat for premium restoration
                await linkWithRevenueCat(result.user.id);
                Alert.alert('Welcome!', `Signed in as ${result.user.displayName || result.user.email}`);
            } else {
                Alert.alert('Sign In Failed', result.error || 'Please try again');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to sign in');
        } finally {
            setSigningIn(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        setUser(null);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                </View>

                {/* User Profile / Sign In Card */}
                {state.user ? (
                    <View style={styles.userCard}>
                        <View style={styles.userAvatar}>
                            {state.user.photoURL ? (
                                <Image source={{ uri: state.user.photoURL }} style={styles.userAvatarImage} />
                            ) : (
                                <Text style={styles.userAvatarText}>
                                    {(state.user.displayName || state.user.email)[0].toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{state.user.displayName || 'User'}</Text>
                            <Text style={styles.userEmail}>{state.user.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.signInCard}
                        onPress={handleSignIn}
                        disabled={signingIn}
                    >
                        <View style={styles.googleIcon}>
                            <Text style={styles.googleIconText}>G</Text>
                        </View>
                        <View style={styles.signInContent}>
                            <Text style={styles.signInTitle}>Sign in with Google</Text>
                            <Text style={styles.signInSubtitle}>Sync recipes & restore purchases</Text>
                        </View>
                        {signingIn && <ActivityIndicator color={colors.primary.main} />}
                    </TouchableOpacity>
                )}

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Progress</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{state.stats.streak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{state.stats.totalRefills}</Text>
                            <Text style={styles.statLabel}>Total Refills</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{state.stats.systemUptime}%</Text>
                            <Text style={styles.statLabel}>System Uptime</Text>
                        </View>
                    </View>
                </View>

                {/* Weekly Graph */}
                <View style={styles.graphCard}>
                    <Text style={styles.graphTitle}>This Week</Text>
                    <View style={styles.graphContainer}>
                        {state.stats.weeklyData.map((day, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View style={styles.barBackground}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            { height: `${(day.refills / 5) * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{day.day}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.graphInsight}>
                        <Text style={styles.insightIcon}>📊</Text>
                        <Text style={styles.insightText}>
                            You refuel every <Text style={styles.insightHighlight}>{state.stats.avgInterval}h</Text> on average
                        </Text>
                    </View>
                </View>

                {/* Premium Banner */}
                {!state.isPremium && (
                    <TouchableOpacity
                        style={styles.premiumBanner}
                        onPress={() => setShowUpgradeModal(true)}
                    >
                        <Text style={styles.premiumEmoji}>🌟</Text>
                        <View style={styles.premiumText}>
                            <Text style={styles.premiumTitle}>Upgrade to Pro</Text>
                            <Text style={styles.premiumSubtitle} numberOfLines={2}>
                                100+ recipes, no ads
                            </Text>
                        </View>
                        <View style={styles.premiumPrice}>
                            <Text style={styles.premiumPriceText}>₹299</Text>
                            <Text style={styles.premiumPriceLabel}>lifetime</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Notifications</Text>
                            <Text style={styles.settingDescription}>
                                Smart reminders for meals and prep
                            </Text>
                        </View>
                        <Switch
                            value={state.notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#E0E0E0', true: colors.primary.light }}
                            thumbColor={state.notificationsEnabled ? colors.primary.main : '#FFF'}
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View style={styles.settingLabelRow}>
                                <Text style={styles.settingLabel}>Rice-First Mode</Text>
                                <TouchableOpacity
                                    style={styles.infoButton}
                                    onPress={() => setShowRiceInfo(!showRiceInfo)}
                                >
                                    <Text style={styles.infoButtonText}>ⓘ</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.settingDescription}>
                                {state.riceMode ? 'Active' : 'Inactive'} - Prioritize rice-based meals
                            </Text>
                            {showRiceInfo && (
                                <View style={styles.infoPopup}>
                                    <Text style={styles.infoPopupText}>
                                        Enforces culturally appropriate meal pairings for Eastern India cuisine.
                                        Rice + dry sabzi will auto-suggest dal/curry. This ensures balanced,
                                        satisfying meals.
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Switch
                            value={state.riceMode}
                            onValueChange={toggleRiceMode}
                            trackColor={{ false: '#E0E0E0', true: colors.primary.light }}
                            thumbColor={state.riceMode ? colors.primary.main : '#FFF'}
                        />
                    </View>
                </View>

                {/* Pantry Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pantry Status</Text>
                    <View style={styles.pantrySummary}>
                        <View style={styles.pantryItem}>
                            <Text style={styles.pantryValue}>{state.pantryItems.length}</Text>
                            <Text style={styles.pantryLabel}>Total Items</Text>
                        </View>
                        <View style={styles.pantryItem}>
                            <Text style={[styles.pantryValue, { color: '#FF9800' }]}>
                                {state.pantryItems.filter(i => i.status === 'expiring').length}
                            </Text>
                            <Text style={styles.pantryLabel}>Expiring</Text>
                        </View>
                        <View style={styles.pantryItem}>
                            <Text style={[styles.pantryValue, { color: colors.critical.main }]}>
                                {state.pantryItems.filter(i => i.status === 'empty').length}
                            </Text>
                            <Text style={styles.pantryLabel}>Out of Stock</Text>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <TouchableOpacity style={styles.menuRow}>
                        <Text style={styles.menuLabel}>Help & Support</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <Text style={styles.menuLabel}>Privacy Policy</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <Text style={styles.menuLabel}>Terms of Service</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Brand Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerBrand}>🍚 RiceBowl</Text>
                    <Text style={styles.footerVersion}>Version 1.0.0</Text>
                    <Text style={styles.footerTagline}>Your Survival Guide</Text>
                </View>
            </ScrollView>

            {/* Premium Upgrade Modal */}
            <Modal
                visible={showUpgradeModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowUpgradeModal(false)}
            >
                <PremiumUpgrade
                    onClose={() => setShowUpgradeModal(false)}
                    onPurchaseComplete={handlePurchaseComplete}
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
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    statsCard: {
        backgroundColor: colors.primary.main,
        marginHorizontal: spacing.lg,
        borderRadius: 22,
        padding: spacing.xl,
        marginBottom: spacing.lg,
    },
    statsTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 45,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    statValue: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.xs,
    },
    graphCard: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 22,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    graphTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.lg,
    },
    graphContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
        marginBottom: spacing.lg,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    barBackground: {
        width: 20,
        height: 80,
        backgroundColor: colors.neutral.background,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        backgroundColor: colors.primary.main,
        borderRadius: 10,
    },
    barLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
    },
    graphInsight: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.background,
        padding: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    insightIcon: {
        fontSize: 16,
    },
    insightText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
    },
    insightHighlight: {
        color: colors.primary.main,
        fontWeight: typography.fontWeight.bold,
    },
    premiumBanner: {
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        borderRadius: 18,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
        borderWidth: 2,
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 3,
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    premiumEmoji: {
        fontSize: 32,
    },
    premiumText: {
        flex: 1,
        flexShrink: 1,
    },
    premiumTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    premiumSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        marginTop: 2,
    },
    premiumPrice: {
        alignItems: 'flex-end',
        minWidth: 60,
        flexShrink: 0,
    },
    premiumPriceText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.main,
    },
    premiumPriceLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    pantrySummary: {
        flexDirection: 'row',
        backgroundColor: colors.neutral.surface,
        borderRadius: 14,
        padding: spacing.lg,
    },
    pantryItem: {
        flex: 1,
        alignItems: 'center',
    },
    pantryValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    pantryLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    settingRow: {
        backgroundColor: colors.neutral.surface,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderRadius: 14,
        marginBottom: spacing.sm,
    },
    settingInfo: {
        flex: 1,
        marginRight: spacing.lg,
    },
    settingLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    settingLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    infoButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoButtonText: {
        fontSize: 12,
        color: colors.neutral.textMuted,
    },
    settingDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    infoPopup: {
        backgroundColor: colors.neutral.background,
        padding: spacing.md,
        borderRadius: 10,
        marginTop: spacing.sm,
    },
    infoPopupText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    menuRow: {
        backgroundColor: colors.neutral.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderRadius: 14,
        marginBottom: spacing.sm,
    },
    menuLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral.textPrimary,
    },
    menuArrow: {
        fontSize: typography.fontSize.md,
        color: colors.neutral.textDisabled,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    footerBrand: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    footerVersion: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textDisabled,
        marginTop: spacing.xs,
    },
    footerTagline: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: 2,
        fontStyle: 'italic',
    },
    // User profile styles
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: 16,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    userAvatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userAvatarText: {
        fontSize: 22,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    userEmail: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    signOutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    signOutText: {
        fontSize: typography.fontSize.sm,
        color: colors.critical.main,
        fontWeight: typography.fontWeight.medium,
    },
    // Sign in card styles
    signInCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutral.border,
    },
    googleIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    googleIconText: {
        fontSize: 22,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    signInContent: {
        flex: 1,
    },
    signInTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    signInSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
});
