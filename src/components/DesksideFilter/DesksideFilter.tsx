/**
 * Deskside Filter - Playful Design
 * Softer green, messiness rating, no-pause-needed foods
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

// Deskside-friendly foods with messiness rating
const DESKSIDE_FOODS = [
    { id: 'd1', name: 'Veggie Wrap', description: 'Roll & eat, zero drip', timeMins: 10, tag: 'onehand', messiness: 1 },
    { id: 'd2', name: 'Protein Smoothie', description: 'Sip while coding', timeMins: 5, tag: 'grab', messiness: 1 },
    { id: 'd3', name: 'Apple Slices + PB', description: 'Crunchy focus fuel', timeMins: 2, tag: 'grab', messiness: 2 },
    { id: 'd4', name: 'Trail Mix', description: 'Energy in every handful', timeMins: 0, tag: 'grab', messiness: 1 },
    { id: 'd5', name: 'Energy Bar', description: 'Compact brain fuel', timeMins: 0, tag: 'grab', messiness: 1 },
    { id: 'd6', name: 'Cheese Cubes', description: 'Protein-packed bites', timeMins: 1, tag: 'veg', messiness: 1 },
    { id: 'd7', name: 'Dry Fruits Mix', description: 'Sweet, nutritious, neat', timeMins: 0, tag: 'grab', messiness: 1 },
    { id: 'd8', name: 'Rice Cake', description: 'Light crunch, clean hands', timeMins: 0, tag: 'veg', messiness: 1 },
];

// Messiness rating component
function MessinessRating({ level }: { level: number }) {
    const drops = [];
    for (let i = 0; i < 3; i++) {
        drops.push(
            <Text
                key={i}
                style={[styles.dropIcon, i < level ? styles.dropActive : styles.dropInactive]}
            >
                💧
            </Text>
        );
    }
    return <View style={styles.messinessContainer}>{drops}</View>;
}

export function DesksideFilter() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Deskside Eats</Text>
                <Text style={styles.subtitle}>No-pause-needed fuel</Text>
            </View>

            {/* Playful Info Card - softer green */}
            <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>⌨️🖐️</Text>
                <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Keep typing, keep eating</Text>
                    <Text style={styles.infoText}>
                        These foods won't leave residue on your keyboard. Eat without breaking flow.
                    </Text>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendLabel}>Messiness: </Text>
                <Text style={styles.legendItem}>💧 = Clean</Text>
                <Text style={styles.legendItem}>💧💧💧 = Careful!</Text>
            </View>

            <ScrollView
                style={styles.foodList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.foodListContent}
            >
                {DESKSIDE_FOODS.map((food) => (
                    <FoodCard key={food.id} food={food} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

interface FoodCardProps {
    food: {
        id: string;
        name: string;
        description: string;
        timeMins: number;
        tag: string;
        messiness: number;
    };
}

function FoodCard({ food }: FoodCardProps) {
    return (
        <TouchableOpacity style={styles.foodCard}>
            <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{food.name}</Text>
                <MessinessRating level={food.messiness} />
            </View>

            <Text style={styles.foodDescription}>{food.description}</Text>

            <View style={styles.foodMeta}>
                {/* Time pill */}
                <View style={styles.timePill}>
                    <Text style={styles.timePillText}>⏱️ {food.timeMins}m</Text>
                </View>

                {/* Tag */}
                <View style={[styles.tag, food.tag === 'grab' && styles.tagGrab]}>
                    <Text style={[styles.tagText, food.tag === 'grab' && styles.tagTextGrab]}>
                        {food.tag === 'grab' ? '⚡ Grab & Go' : '🌿 Veg'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
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
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9', // Softer green
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        borderRadius: 18,
        gap: spacing.md,
    },
    infoIcon: {
        fontSize: 28,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#388E3C', // Softer green text
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        color: '#4CAF50', // Softer green
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    legendLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    legendItem: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
    },
    foodList: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    foodListContent: {
        paddingBottom: spacing['3xl'],
    },
    foodCard: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 18,
        padding: spacing.xl,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    foodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    foodName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        flex: 1,
    },
    messinessContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    dropIcon: {
        fontSize: 12,
    },
    dropActive: {
        opacity: 1,
    },
    dropInactive: {
        opacity: 0.2,
    },
    foodDescription: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.md,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    foodMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    timePill: {
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    timePillText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    tagGrab: {
        backgroundColor: colors.primary.main + '18',
    },
    tagText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: '#388E3C',
    },
    tagTextGrab: {
        color: colors.primary.main,
    },
});
