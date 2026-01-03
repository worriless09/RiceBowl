/**
 * Panic Pantry - Simplified Design
 * No calories in main view, emotional descriptions, single tag per card
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../config/theme';
import { TimeTier, Recipe } from '../../database/schema';

// Simplified recipe data with emotional descriptions
const PANIC_RECIPES: Record<TimeTier, Array<{
    id: string;
    name: string;
    emotion: string;
    timeMins: number;
    tag: 'veg' | 'grab' | 'onehand' | null;
    calories?: number;
    protein?: number;
}>> = {
    1: [
        { id: '1', name: 'Handful of Almonds', emotion: 'Crunchy, satisfying, brain fuel', timeMins: 0, tag: 'grab' },
        { id: '2', name: 'Banana', emotion: 'Sweet, instant energy', timeMins: 0, tag: 'onehand' },
        { id: '3', name: 'Greek Yogurt', emotion: 'Creamy, cooling, protein-packed', timeMins: 1, tag: 'veg', calories: 150, protein: 15 },
        { id: '4', name: 'Peanut Butter Toast', emotion: 'Warm, filling, familiar', timeMins: 2, tag: 'grab' },
        { id: '5', name: 'Makhana', emotion: 'Light, crunchy, guilt-free', timeMins: 0, tag: 'veg' },
    ],
    10: [
        { id: '6', name: 'Scrambled Eggs', emotion: 'Warm, comforting, homey', timeMins: 7, tag: 'veg', calories: 200, protein: 14 },
        { id: '7', name: 'Quick Sandwich', emotion: 'Filling, customizable, reliable', timeMins: 5, tag: 'onehand' },
        { id: '8', name: 'Instant Poha', emotion: 'Light, savory, nostalgic', timeMins: 10, tag: 'veg' },
        { id: '9', name: 'Heated Leftovers', emotion: 'Zero decisions, maximum comfort', timeMins: 5, tag: null },
        { id: '10', name: 'Maggi Noodles', emotion: 'Classic, quick, soul-warming', timeMins: 6, tag: 'veg' },
    ],
    30: [
        { id: '11', name: 'Khichdi', emotion: 'Ultimate comfort, easy on the soul', timeMins: 25, tag: 'veg', calories: 350, protein: 12 },
        { id: '12', name: 'Egg Fried Rice', emotion: 'Satisfying, use-up-leftovers magic', timeMins: 20, tag: null },
        { id: '13', name: 'Dal Tadka', emotion: 'Warm, aromatic, home-cooked love', timeMins: 30, tag: 'veg' },
        { id: '14', name: 'Aloo Bhujia', emotion: 'Simple, familiar, reliable', timeMins: 25, tag: 'veg' },
    ],
};

const TIER_INFO: Record<TimeTier, { icon: string; urgent: string }> = {
    1: { icon: '⚡', urgent: 'Emergency' },
    10: { icon: '🍳', urgent: 'Quick Fix' },
    30: { icon: '🍲', urgent: 'Take Your Time' },
};

export function PanicPantry() {
    const [selectedTier, setSelectedTier] = useState<TimeTier>(10);
    const recipes = PANIC_RECIPES[selectedTier];
    const tierInfo = TIER_INFO[selectedTier];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Panic Pantry</Text>
                <Text style={styles.subtitle}>How urgent is this?</Text>
            </View>

            {/* Time Tier Selector */}
            <View style={styles.tierSelector}>
                {([1, 10, 30] as TimeTier[]).map((tier) => (
                    <TierButton
                        key={tier}
                        tier={tier}
                        icon={TIER_INFO[tier].icon}
                        isSelected={selectedTier === tier}
                        onPress={() => setSelectedTier(tier)}
                    />
                ))}
            </View>

            {/* Selected Tier Header */}
            <View style={styles.tierHeader}>
                <Text style={styles.tierEmoji}>{tierInfo.icon}</Text>
                <Text style={styles.tierLabel}>{selectedTier} minute tier</Text>
            </View>

            {/* Recipe List - Simplified Cards */}
            <ScrollView
                style={styles.recipeList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.recipeListContent}
            >
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

interface TierButtonProps {
    tier: TimeTier;
    icon: string;
    isSelected: boolean;
    onPress: () => void;
}

function TierButton({ tier, icon, isSelected, onPress }: TierButtonProps) {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
        });
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={[styles.tierButton, isSelected && styles.tierButtonSelected]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Text style={styles.tierIcon}>{icon}</Text>
                <Text style={[styles.tierButtonLabel, isSelected && styles.tierButtonLabelSelected]}>
                    {tier} min
                </Text>
                {isSelected && <View style={styles.tierGradient} />}
            </TouchableOpacity>
        </Animated.View>
    );
}

interface RecipeCardProps {
    recipe: {
        id: string;
        name: string;
        emotion: string;
        timeMins: number;
        tag: 'veg' | 'grab' | 'onehand' | null;
        calories?: number;
        protein?: number;
    };
}

function RecipeCard({ recipe }: RecipeCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    const getTagInfo = () => {
        switch (recipe.tag) {
            case 'veg': return { label: '🌿 Veg', color: '#4CAF50' };
            case 'grab': return { label: '⚡ Grab & Go', color: colors.primary.main };
            case 'onehand': return { label: '🖐️ One-hand', color: colors.accent.main };
            default: return null;
        }
    };

    const tagInfo = getTagInfo();

    return (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.9}
        >
            <View style={styles.recipeMain}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeEmotion}>{recipe.emotion}</Text>
            </View>

            <View style={styles.recipeMeta}>
                {/* Time - pill shape */}
                <View style={styles.timePill}>
                    <Text style={styles.timePillText}>⏱️ {recipe.timeMins}m</Text>
                </View>

                {/* Single tag */}
                {tagInfo && (
                    <View style={[styles.tag, { backgroundColor: tagInfo.color + '18' }]}>
                        <Text style={[styles.tagText, { color: tagInfo.color }]}>{tagInfo.label}</Text>
                    </View>
                )}
            </View>

            {/* Tap-to-reveal nutrition (hidden by default) */}
            {showDetails && recipe.calories && (
                <View style={styles.nutritionReveal}>
                    <Text style={styles.nutritionText}>
                        {recipe.calories} cal • {recipe.protein}g protein
                    </Text>
                </View>
            )}
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
    tierSelector: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    tierButton: {
        flex: 1,
        backgroundColor: colors.neutral.surface,
        borderRadius: 18,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.neutral.border,
        overflow: 'hidden',
    },
    tierButtonSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.neutral.surface,
    },
    tierGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: colors.primary.main + '15',
    },
    tierIcon: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    tierButtonLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
    },
    tierButtonLabelSelected: {
        color: colors.primary.main,
    },
    tierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.sm,
    },
    tierEmoji: {
        fontSize: 24,
    },
    tierLabel: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    recipeList: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    recipeListContent: {
        paddingBottom: spacing['3xl'],
    },
    recipeCard: {
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
    recipeMain: {
        marginBottom: spacing.md,
    },
    recipeName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.xs,
        lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    },
    recipeEmotion: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    recipeMeta: {
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    tagText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    nutritionReveal: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.border,
    },
    nutritionText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
    },
});
