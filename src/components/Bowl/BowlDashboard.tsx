/**
 * Bowl Dashboard - System Monitor Design
 * Large central bowl, time indicator, satisfying refill animation
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    useColorScheme,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { BowlVisual } from './BowlVisual';
import { useBowlState, formatTimeSince } from './useBowlState';
import { colors, spacing, typography } from '../../config/theme';

const { width } = Dimensions.get('window');
const BOWL_SIZE = width * 0.75; // 60% larger, center stage

export function BowlDashboard() {
    const { status, isLoading, refillBowl } = useBowlState();
    const [isRefilling, setIsRefilling] = useState(false);

    // Refill animation
    const fillAnimation = useSharedValue(0);
    const buttonScale = useSharedValue(1);

    const handleRefill = async () => {
        setIsRefilling(true);

        // Button press feedback
        buttonScale.value = withSequence(
            withTiming(0.95, { duration: 100 }),
            withSpring(1, { damping: 15 })
        );

        // Satisfying fill animation
        fillAnimation.value = withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 200 })
        );

        await refillBowl();

        setTimeout(() => setIsRefilling(false), 600);
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Initializing system...</Text>
            </View>
        );
    }

    const isCritical = status.state === 'critical';
    const isLow = status.state === 'low';

    return (
        <SafeAreaView style={[styles.container, isCritical && styles.criticalBg]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>RiceBowl</Text>
                <Text style={styles.subtitle}>Your System Monitor</Text>
            </View>

            {/* Central Bowl - 60% larger, center stage */}
            <View style={styles.bowlContainer}>
                <BowlVisual
                    state={status.state}
                    percentage={status.percentage}
                    color={status.color}
                    animationType={status.animationType}
                    size={BOWL_SIZE}
                />

                {/* Time indicator below bowl */}
                <View style={styles.timeIndicator}>
                    <Text style={styles.timeLabel}>
                        {status.lastFilledAt
                            ? `Last refill: ${formatTimeSince(status.hoursSinceMeal)}`
                            : 'No refills logged yet'}
                    </Text>
                </View>
            </View>

            {/* Status Message */}
            <View style={styles.messageContainer}>
                <Text style={[
                    styles.message,
                    isCritical && styles.criticalText,
                    isLow && styles.lowText,
                ]}>
                    {status.message}
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionContainer}>
                <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity
                        style={[
                            styles.refillButton,
                            isCritical && styles.criticalButton,
                            isRefilling && styles.refillButtonActive,
                        ]}
                        onPress={handleRefill}
                        activeOpacity={0.8}
                        disabled={isRefilling}
                    >
                        <Text style={styles.refillButtonText}>
                            {isRefilling ? '🍚 Refilling...' : '🍚 I Just Ate'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity style={styles.panicButton}>
                    <Text style={styles.panicButtonText}>
                        😰 Need ideas? Open Panic Pantry
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Quick Time Tiers */}
            <View style={styles.quickActions}>
                <QuickActionCard
                    icon="⚡"
                    label="1 min"
                    sublabel="Emergency"
                    isUrgent={isCritical}
                />
                <QuickActionCard
                    icon="🍳"
                    label="10 min"
                    sublabel="Quick Fix"
                    isUrgent={false}
                />
                <QuickActionCard
                    icon="🍲"
                    label="30 min"
                    sublabel="Comfort"
                    isUrgent={false}
                />
            </View>
        </SafeAreaView>
    );
}

interface QuickActionCardProps {
    icon: string;
    label: string;
    sublabel: string;
    isUrgent?: boolean;
}

function QuickActionCard({ icon, label, sublabel, isUrgent }: QuickActionCardProps) {
    return (
        <TouchableOpacity style={[styles.quickCard, isUrgent && styles.quickCardUrgent]}>
            <Text style={styles.quickIcon}>{icon}</Text>
            <Text style={[styles.quickLabel, isUrgent && styles.quickLabelUrgent]}>{label}</Text>
            <Text style={styles.quickSublabel}>{sublabel}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.background,
    },
    criticalBg: {
        backgroundColor: '#FDF5F4',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral.background,
    },
    loadingText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral.textMuted,
    },
    header: {
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    bowlContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    timeIndicator: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.neutral.surface,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    timeLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    messageContainer: {
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.md,
    },
    message: {
        fontSize: typography.fontSize.md,
        color: colors.neutral.textSecondary,
        textAlign: 'center',
        lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    },
    lowText: {
        color: colors.bowl.low,
        fontWeight: typography.fontWeight.medium,
    },
    criticalText: {
        color: colors.critical.main,
        fontWeight: typography.fontWeight.semibold,
    },
    actionContainer: {
        paddingHorizontal: spacing['2xl'],
        gap: spacing.md,
    },
    refillButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 18,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    refillButtonActive: {
        backgroundColor: colors.primary.light,
    },
    criticalButton: {
        backgroundColor: colors.critical.main,
        shadowColor: colors.critical.main,
    },
    refillButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    panicButton: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary.light + '40',
    },
    panicButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.main,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['2xl'],
        gap: spacing.md,
    },
    quickCard: {
        flex: 1,
        backgroundColor: colors.neutral.surface,
        borderRadius: 18,
        padding: spacing.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    quickCardUrgent: {
        borderWidth: 2,
        borderColor: colors.critical.light,
    },
    quickIcon: {
        fontSize: 30,
        marginBottom: spacing.sm,
    },
    quickLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    quickLabelUrgent: {
        color: colors.critical.main,
    },
    quickSublabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
});
