/**
 * Today's Plan Screen - Connected to Global State
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Switch,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { useAppState } from '../../store/AppStore';
import { colors, spacing, typography } from '../../config/theme';

export function TodaysPlan() {
    const { state, toggleRiceMode, markMealCooked, dismissAlert } = useAppState();

    const visibleAlerts = state.alerts.filter(a => !a.isDismissed);
    const cookedCount = state.meals.filter(m => m.isCooked).length;
    const totalCookTime = state.meals.filter(m => !m.isCooked).reduce((sum, m) => sum + m.duration, 0);

    // Format today's date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Streak */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.brandName}>🍚 RiceBowl</Text>
                    <Text style={styles.brandTagline}>Survival Guide</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Text style={styles.streakIcon}>🔥</Text>
                    <Text style={styles.streakText}>{state.stats.streak} Day Streak</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Today's Header */}
                <View style={styles.dateHeader}>
                    <View>
                        <Text style={styles.dateTitle}>Today's Plan</Text>
                        <Text style={styles.dateSubtitle}>{dateString}</Text>
                    </View>
                    <View style={styles.riceModeContainer}>
                        <Text style={styles.riceModeLabel}>Rice Mode</Text>
                        <Switch
                            value={state.riceMode}
                            onValueChange={toggleRiceMode}
                            trackColor={{ false: '#E0E0E0', true: colors.primary.light }}
                            thumbColor={state.riceMode ? colors.primary.main : '#FFF'}
                        />
                    </View>
                </View>

                {/* Critical Alerts */}
                {visibleAlerts.map((alert) => (
                    <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={() => dismissAlert(alert.id)}
                    />
                ))}

                {/* Meal Cards */}
                {state.meals.map((meal) => (
                    <MealCard
                        key={meal.id}
                        meal={meal}
                        onMarkCooked={() => markMealCooked(meal.id)}
                    />
                ))}

                {/* Bio-Rhythm Check */}
                <View style={styles.bioRhythmCard}>
                    <Text style={styles.bioRhythmTitle}>BIO-RHYTHM CHECK</Text>
                    <View style={styles.bioRhythmContent}>
                        <Text style={styles.bioRhythmIcon}>☕</Text>
                        <Text style={styles.bioRhythmMessage}>
                            4:00 PM: Time for Chai?
                        </Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{cookedCount}/{state.meals.length}</Text>
                        <Text style={styles.statLabel}>Meals Complete</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>~{totalCookTime}m</Text>
                        <Text style={styles.statLabel}>Cook Time Left</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface AlertCardProps {
    alert: {
        id: string;
        type: string;
        icon: string;
        title: string;
        message: string;
        actionLabel: string;
        isUrgent: boolean;
    };
    onDismiss: () => void;
}

function AlertCard({ alert, onDismiss }: AlertCardProps) {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSequence(
            withTiming(0.95, { duration: 100 }),
            withSpring(1)
        );
        onDismiss();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.alertCard, alert.isUrgent && styles.alertCardUrgent, animatedStyle]}>
            <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>{alert.icon}</Text>
                <Text style={[styles.alertTitle, alert.isUrgent && styles.alertTitleUrgent]}>
                    {alert.title}
                </Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <TouchableOpacity
                style={[styles.alertButton, alert.isUrgent && styles.alertButtonUrgent]}
                onPress={handlePress}
            >
                <Text style={[styles.alertButtonText, alert.isUrgent && styles.alertButtonTextUrgent]}>
                    {alert.actionLabel}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

interface MealCardProps {
    meal: {
        id: string;
        time: string;
        label: string;
        name: string;
        duration: number;
        hasRiceRule: boolean;
        isCooked: boolean;
        note?: string;
    };
    onMarkCooked: () => void;
}

function MealCard({ meal, onMarkCooked }: MealCardProps) {
    const checkScale = useSharedValue(1);

    const handleMarkCooked = () => {
        checkScale.value = withSequence(
            withTiming(1.3, { duration: 150 }),
            withSpring(1, { damping: 10 })
        );
        onMarkCooked();
    };

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    return (
        <View style={[styles.mealCard, meal.isCooked && styles.mealCardCooked]}>
            <View style={styles.mealHeader}>
                <Text style={styles.mealLabel}>{meal.label} • {meal.time}</Text>
                <Animated.View style={checkStyle}>
                    {meal.isCooked && <Text style={styles.cookedCheck}>✓</Text>}
                </Animated.View>
            </View>

            <Text style={[styles.mealName, meal.isCooked && styles.mealNameCooked]}>
                {meal.name}
            </Text>

            <View style={styles.mealMeta}>
                <View style={styles.durationPill}>
                    <Text style={styles.durationText}>🍳 {meal.duration} min</Text>
                </View>
                {meal.hasRiceRule && (
                    <View style={styles.riceRuleBadge}>
                        <Text style={styles.riceRuleText}>Rice First Rule</Text>
                    </View>
                )}
            </View>

            {!meal.isCooked && (
                <TouchableOpacity style={styles.markCookedButton} onPress={handleMarkCooked}>
                    <Text style={styles.markCookedText}>Mark as Cooked</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        paddingTop: spacing.xl,
    },
    brandName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    brandTagline: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        gap: spacing.xs,
    },
    streakIcon: {
        fontSize: 14,
    },
    streakText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: '#FFF',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    dateTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    dateSubtitle: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    riceModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    riceModeLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.primary.main,
    },
    alertCard: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary.main,
    },
    alertCardUrgent: {
        backgroundColor: '#FFF5F5',
        borderLeftColor: colors.critical.main,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    alertIcon: {
        fontSize: 18,
    },
    alertTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.secondary.dark,
        letterSpacing: 0.5,
    },
    alertTitleUrgent: {
        color: colors.critical.main,
    },
    alertMessage: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
        marginBottom: spacing.md,
    },
    alertButton: {
        alignSelf: 'flex-start',
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.neutral.border,
    },
    alertButtonUrgent: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    alertButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
    },
    alertButtonTextUrgent: {
        color: '#FFF',
    },
    mealCard: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    mealCardCooked: {
        opacity: 0.7,
        backgroundColor: '#F8FFF8',
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    mealLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    cookedCheck: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: typography.fontWeight.bold,
    },
    mealName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.md,
    },
    mealNameCooked: {
        textDecorationLine: 'line-through',
        color: colors.neutral.textMuted,
    },
    mealMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    durationPill: {
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    durationText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    riceRuleBadge: {
        backgroundColor: colors.primary.main + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    riceRuleText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.semibold,
    },
    markCookedButton: {
        backgroundColor: colors.neutral.textPrimary,
        borderRadius: 12,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    markCookedText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: '#FFF',
    },
    bioRhythmCard: {
        backgroundColor: colors.accent.main + '15',
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    bioRhythmTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.accent.dark,
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    bioRhythmContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    bioRhythmIcon: {
        fontSize: 20,
    },
    bioRhythmMessage: {
        fontSize: typography.fontSize.base,
        color: colors.accent.dark,
        fontWeight: typography.fontWeight.medium,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing['3xl'],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    statLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
    },
});
