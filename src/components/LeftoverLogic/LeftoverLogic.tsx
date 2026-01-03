/**
 * Leftover Logic - Simplified Design
 * Single text input with autocomplete, max 6 quick-tap items
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../config/theme';

// Quick-tap common ingredients (max 6 visible)
const QUICK_INGREDIENTS = [
    { name: 'Rice', icon: '🍚' },
    { name: 'Egg', icon: '🥚' },
    { name: 'Bread', icon: '🍞' },
    { name: 'Potato', icon: '🥔' },
    { name: 'Onion', icon: '🧅' },
];

// All available ingredients for autocomplete
const ALL_INGREDIENTS = [
    'Rice', 'Egg', 'Bread', 'Potato', 'Onion', 'Tomato', 'Dal', 'Milk',
    'Cheese', 'Butter', 'Paneer', 'Chicken', 'Yogurt', 'Garlic', 'Ginger',
    'Capsicum', 'Carrot', 'Peas', 'Spinach', 'Mushroom', 'Noodles', 'Pasta',
];

// Recipe suggestions based on ingredients
const RECIPE_MATCHES: Record<string, Array<{
    name: string;
    description: string;
    time: number;
}>> = {
    'rice,egg': [
        { name: 'Egg Fried Rice', description: 'Classic comfort, leftover magic', time: 15 },
        { name: 'Egg Rice Bowl', description: 'Simple, protein-packed', time: 10 },
    ],
    'rice,dal': [
        { name: 'Dal Chawal', description: 'The eternal comfort combo', time: 25 },
        { name: 'Khichdi', description: 'One-pot soul food', time: 20 },
    ],
    'egg,bread': [
        { name: 'French Toast', description: 'Sweet, satisfying breakfast-for-dinner', time: 10 },
        { name: 'Egg Sandwich', description: 'Quick, filling, reliable', time: 8 },
    ],
    'potato,egg': [
        { name: 'Potato Egg Scramble', description: 'Hearty, homey, filling', time: 15 },
        { name: 'Aloo Paratha with Egg', description: 'Comfort meets protein', time: 25 },
    ],
    'potato,onion': [
        { name: 'Aloo Pyaaz', description: 'Simple, aromatic, goes-with-anything', time: 20 },
        { name: 'Potato Tikki', description: 'Crispy, snacky, satisfying', time: 25 },
    ],
};

export function LeftoverLogic() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const buttonPulse = useSharedValue(1);

    // Autocomplete suggestions
    const suggestions = useMemo(() => {
        if (searchQuery.length < 2) return [];
        const query = searchQuery.toLowerCase();
        return ALL_INGREDIENTS.filter(
            ing => ing.toLowerCase().includes(query) && !selectedIngredients.includes(ing)
        ).slice(0, 4);
    }, [searchQuery, selectedIngredients]);

    // Recipe matches
    const matchingRecipes = useMemo(() => {
        if (selectedIngredients.length < 1) return [];
        const key = selectedIngredients.map(i => i.toLowerCase()).sort().join(',');
        return RECIPE_MATCHES[key] || [];
    }, [selectedIngredients]);

    const toggleIngredient = (name: string) => {
        if (selectedIngredients.includes(name)) {
            setSelectedIngredients(prev => prev.filter(i => i !== name));
        } else if (selectedIngredients.length < 2) {
            setSelectedIngredients(prev => [...prev, name]);
            // Pulse the button when ready
            if (selectedIngredients.length === 0) {
                buttonPulse.value = withSequence(
                    withTiming(1.05, { duration: 200 }),
                    withSpring(1)
                );
            }
        }
        setSearchQuery('');
    };

    const addFromSearch = (name: string) => {
        toggleIngredient(name);
        setSearchQuery('');
    };

    const clearAll = () => {
        setSelectedIngredients([]);
        setSearchQuery('');
    };

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonPulse.value }],
    }));

    const hasSelection = selectedIngredients.length >= 1;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Leftover Logic</Text>
                <Text style={styles.subtitle}>What's in your fridge?</Text>
            </View>

            {/* Single Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Type an ingredient..."
                    placeholderTextColor={colors.neutral.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {suggestions.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                        {suggestions.map((ing) => (
                            <TouchableOpacity
                                key={ing}
                                style={styles.suggestionItem}
                                onPress={() => addFromSearch(ing)}
                            >
                                <Text style={styles.suggestionText}>{ing}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Quick-tap ingredients (max 6 visible) */}
            <View style={styles.quickGrid}>
                {QUICK_INGREDIENTS.map((ing) => (
                    <IngredientChip
                        key={ing.name}
                        name={ing.name}
                        icon={ing.icon}
                        isSelected={selectedIngredients.includes(ing.name)}
                        onPress={() => toggleIngredient(ing.name)}
                        disabled={selectedIngredients.length >= 2 && !selectedIngredients.includes(ing.name)}
                    />
                ))}
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => setShowMoreModal(true)}
                >
                    <Text style={styles.moreButtonIcon}>+</Text>
                    <Text style={styles.moreButtonText}>More</Text>
                </TouchableOpacity>
            </View>

            {/* Selected ingredients display */}
            {selectedIngredients.length > 0 && (
                <View style={styles.selectedContainer}>
                    <View style={styles.selectedHeader}>
                        <Text style={styles.selectedLabel}>Selected ({selectedIngredients.length}/2)</Text>
                        <TouchableOpacity onPress={clearAll}>
                            <Text style={styles.clearButton}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.selectedChips}>
                        {selectedIngredients.map((ing) => (
                            <View key={ing} style={styles.selectedChip}>
                                <Text style={styles.selectedChipText}>{ing}</Text>
                                <TouchableOpacity onPress={() => toggleIngredient(ing)}>
                                    <Text style={styles.removeChip}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* CTA Button - pulsing when ready */}
            <Animated.View style={[styles.ctaContainer, buttonStyle]}>
                <TouchableOpacity
                    style={[styles.ctaButton, !hasSelection && styles.ctaButtonDisabled]}
                    disabled={!hasSelection}
                >
                    <Text style={styles.ctaButtonText}>
                        {hasSelection ? '🔍 Show me something now' : 'Select ingredients above'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Recipe Results */}
            {matchingRecipes.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>You can make:</Text>
                    {matchingRecipes.map((recipe, index) => (
                        <TouchableOpacity key={index} style={styles.resultCard}>
                            <Text style={styles.resultName}>{recipe.name}</Text>
                            <Text style={styles.resultDescription}>{recipe.description}</Text>
                            <View style={styles.timePill}>
                                <Text style={styles.timePillText}>⏱️ {recipe.time} min</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {hasSelection && matchingRecipes.length === 0 && (
                <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsIcon}>🤔</Text>
                    <Text style={styles.noResultsText}>
                        No exact matches. Try a different combination!
                    </Text>
                </View>
            )}

            {/* More Ingredients Modal */}
            <Modal
                visible={showMoreModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMoreModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>All Ingredients</Text>
                            <TouchableOpacity onPress={() => setShowMoreModal(false)}>
                                <Text style={styles.modalClose}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.modalGrid}>
                                {ALL_INGREDIENTS.map((ing) => (
                                    <TouchableOpacity
                                        key={ing}
                                        style={[
                                            styles.modalChip,
                                            selectedIngredients.includes(ing) && styles.modalChipSelected,
                                        ]}
                                        onPress={() => toggleIngredient(ing)}
                                        disabled={selectedIngredients.length >= 2 && !selectedIngredients.includes(ing)}
                                    >
                                        <Text style={[
                                            styles.modalChipText,
                                            selectedIngredients.includes(ing) && styles.modalChipTextSelected,
                                        ]}>
                                            {ing}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

interface IngredientChipProps {
    name: string;
    icon: string;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
}

function IngredientChip({ name, icon, isSelected, onPress, disabled }: IngredientChipProps) {
    const scale = useSharedValue(1);

    const handlePress = () => {
        if (disabled) return;
        // "Drop into pot" animation
        scale.value = withSequence(
            withTiming(0.9, { duration: 80 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={[
                    styles.ingredientChip,
                    isSelected && styles.ingredientChipSelected,
                    disabled && styles.ingredientChipDisabled,
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Text style={styles.ingredientIcon}>{icon}</Text>
                <Text style={[
                    styles.ingredientName,
                    isSelected && styles.ingredientNameSelected,
                ]}>
                    {name}
                </Text>
            </TouchableOpacity>
        </Animated.View>
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
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        zIndex: 10,
    },
    searchInput: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        fontSize: typography.fontSize.md,
        borderWidth: 2,
        borderColor: colors.neutral.border,
        color: colors.neutral.textPrimary,
    },
    suggestionsDropdown: {
        position: 'absolute',
        top: 58,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.neutral.surface,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 20,
    },
    suggestionItem: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.border,
    },
    suggestionText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral.textPrimary,
    },
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    ingredientChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.neutral.border,
        gap: spacing.sm,
        minHeight: 48, // Touch target
    },
    ingredientChipSelected: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    ingredientChipDisabled: {
        opacity: 0.4,
    },
    ingredientIcon: {
        fontSize: 20,
    },
    ingredientName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
    },
    ingredientNameSelected: {
        color: '#FFF',
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.neutral.border,
        borderStyle: 'dashed',
        gap: spacing.xs,
        minHeight: 48,
    },
    moreButtonIcon: {
        fontSize: 18,
        color: colors.neutral.textMuted,
        fontWeight: typography.fontWeight.bold,
    },
    moreButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    selectedContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
    },
    selectedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    selectedLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    clearButton: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.semibold,
    },
    selectedChips: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary.light + '30',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        gap: spacing.sm,
    },
    selectedChipText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.dark,
    },
    removeChip: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.bold,
    },
    ctaContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing['2xl'],
    },
    ctaButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    ctaButtonDisabled: {
        backgroundColor: colors.neutral.textDisabled,
        shadowOpacity: 0,
    },
    ctaButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    resultsContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing['2xl'],
        paddingBottom: spacing['3xl'],
    },
    resultsTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.md,
    },
    resultCard: {
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
    resultName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.xs,
    },
    resultDescription: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.md,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    timePill: {
        alignSelf: 'flex-start',
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
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
        paddingHorizontal: spacing['2xl'],
    },
    noResultsIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    noResultsText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.neutral.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.border,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    modalClose: {
        fontSize: typography.fontSize.md,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.semibold,
    },
    modalScroll: {
        padding: spacing.lg,
    },
    modalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingBottom: spacing['3xl'],
    },
    modalChip: {
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.neutral.border,
    },
    modalChipSelected: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    modalChipText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    modalChipTextSelected: {
        color: '#FFF',
    },
});
