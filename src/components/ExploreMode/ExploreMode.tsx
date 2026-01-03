/**
 * Explore Mode - With Premium Recipe Gating
 * 30 Free / 90 Premium recipes
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { useAppState, CustomRecipe } from '../../store/AppStore';
import {
    recipes,
    Recipe,
    getRecipesByTier,
    searchRecipes,
    TIER_LABELS,
    RECIPE_STATS,
    isFreeRecipe,
    FREE_RECIPE_IDS,
} from '../../data/recipeHelpers';

// Categories with dynamic counts
const EXPLORE_CATEGORIES = [
    { id: 'deskside', name: 'Deskside', icon: '⌨️', tag: 'deskside' },
    { id: 'high-protein', name: 'High Protein', icon: '💪', tag: 'high-protein' },
    { id: 'vegan', name: 'Vegan', icon: '🌱', tag: 'vegan' },
    { id: 'comfort', name: 'Comfort', icon: '🛋️', tag: 'comfort' },
    { id: 'leftover', name: 'Leftover Hacks', icon: '♻️', tag: 'leftover-hack' },
    { id: 'sweet', name: 'Sweet', icon: '🍬', tag: 'sweet' },
    { id: 'custom', name: 'My Recipes', icon: '✏️', tag: 'custom' },
];

export function ExploreMode() {
    const { state, addCustomRecipe } = useAppState();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Add Recipe Modal State
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [newRecipeName, setNewRecipeName] = useState('');
    const [newRecipePrepTime, setNewRecipePrepTime] = useState('');
    const [newRecipeServings, setNewRecipeServings] = useState('1');
    const [newRecipeIngredients, setNewRecipeIngredients] = useState('');
    const [newRecipeInstructions, setNewRecipeInstructions] = useState('');

    const isPremium = state.isPremium;

    const displayRecipes = useMemo(() => {
        let filtered = recipes;

        if (selectedTag === 'custom') {
            // Show custom recipes
            return state.customRecipes.map(r => ({
                ...r,
                tier: 2 as const,
            }));
        }

        if (searchQuery.length >= 2) {
            filtered = searchRecipes(searchQuery);
        } else if (selectedTier) {
            filtered = getRecipesByTier(selectedTier);
        } else if (selectedTag) {
            filtered = recipes.filter(r => r.tags.includes(selectedTag));
        }

        return filtered.slice(0, 30);
    }, [searchQuery, selectedTier, selectedTag, state.customRecipes]);

    const clearFilters = () => {
        setSelectedTier(null);
        setSelectedTag(null);
        setSearchQuery('');
    };

    const handleRecipePress = (recipe: Recipe) => {
        const canAccess = isPremium || isFreeRecipe(recipe.id);
        if (canAccess) {
            setSelectedRecipe(recipe);
        } else {
            setShowUpgradeModal(true);
        }
    };

    const handleAddRecipe = () => {
        if (!newRecipeName.trim()) {
            Alert.alert('Error', 'Please enter a recipe name');
            return;
        }
        if (!newRecipeIngredients.trim()) {
            Alert.alert('Error', 'Please enter at least one ingredient');
            return;
        }
        if (!newRecipeInstructions.trim()) {
            Alert.alert('Error', 'Please enter cooking instructions');
            return;
        }

        addCustomRecipe({
            name: newRecipeName.trim(),
            prep_time: parseInt(newRecipePrepTime) || 10,
            servings: parseInt(newRecipeServings) || 1,
            ingredients: newRecipeIngredients.split('\n').filter(i => i.trim()),
            instructions: newRecipeInstructions.trim(),
            tags: ['custom'],
        });

        // Reset form
        setNewRecipeName('');
        setNewRecipePrepTime('');
        setNewRecipeServings('1');
        setNewRecipeIngredients('');
        setNewRecipeInstructions('');
        setShowAddRecipeModal(false);

        Alert.alert('Success!', 'Your recipe has been added to "My Recipes"');
    };

    const freeCount = FREE_RECIPE_IDS.length;
    const premiumCount = RECIPE_STATS.total - freeCount;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Explore</Text>
                    <Text style={styles.subtitle}>
                        {isPremium ? `${RECIPE_STATS.total} recipes` : `${freeCount} free • ${premiumCount} premium`}
                    </Text>
                </View>
                {!isPremium && (
                    <TouchableOpacity
                        style={styles.proBadge}
                        onPress={() => setShowUpgradeModal(true)}
                    >
                        <Text style={styles.proBadgeText}>🌟 Unlock All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search recipes or ingredients..."
                    placeholderTextColor={colors.neutral.textMuted}
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.length > 0) {
                            setSelectedTier(null);
                            setSelectedTag(null);
                        }
                    }}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearSearch}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tier Filter */}
                <View style={styles.tierFilter}>
                    {([1, 2, 3] as const).map((tier) => (
                        <TouchableOpacity
                            key={tier}
                            style={[styles.tierButton, selectedTier === tier && styles.tierButtonActive]}
                            onPress={() => {
                                setSelectedTier(selectedTier === tier ? null : tier);
                                setSelectedTag(null);
                                setSearchQuery('');
                            }}
                        >
                            <Text style={styles.tierIcon}>{TIER_LABELS[tier].icon}</Text>
                            <Text style={[styles.tierLabel, selectedTier === tier && styles.tierLabelActive]}>
                                {TIER_LABELS[tier].name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Categories */}
                {!searchQuery && !selectedTier && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <View style={styles.categoriesGrid}>
                            {EXPLORE_CATEGORIES.map((cat) => {
                                const count = recipes.filter(r => r.tags.includes(cat.tag)).length;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryCard, selectedTag === cat.tag && styles.categoryCardActive]}
                                        onPress={() => {
                                            setSelectedTag(selectedTag === cat.tag ? null : cat.tag);
                                            setSelectedTier(null);
                                        }}
                                    >
                                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categoryCount}>{count} recipes</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Active Filter Badge */}
                {(selectedTier || selectedTag || searchQuery) && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>
                            {searchQuery ? `Search: "${searchQuery}"` :
                                selectedTier ? `${TIER_LABELS[selectedTier].icon} ${TIER_LABELS[selectedTier].name}` :
                                    selectedTag}
                        </Text>
                        <TouchableOpacity onPress={clearFilters}>
                            <Text style={styles.filterClear}>Clear ✕</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Recipe List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {searchQuery ? 'Search Results' :
                            selectedTier || selectedTag ? 'Filtered Results' :
                                'All Recipes'}
                        {' '}({displayRecipes.length})
                    </Text>

                    {displayRecipes.map((recipe) => {
                        const isLocked = !isPremium && !isFreeRecipe(recipe.id);

                        return (
                            <TouchableOpacity
                                key={recipe.id}
                                style={[styles.recipeCard, isLocked && styles.recipeCardLocked]}
                                onPress={() => handleRecipePress(recipe)}
                            >
                                <View style={styles.recipeHeader}>
                                    <View style={styles.recipeNameRow}>
                                        <Text style={[styles.recipeName, isLocked && styles.recipeNameLocked]}>
                                            {recipe.name}
                                        </Text>
                                        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                                    </View>
                                    <View style={[styles.tierBadge, isLocked && styles.tierBadgeLocked]}>
                                        <Text style={styles.tierBadgeText}>
                                            {TIER_LABELS[recipe.tier].icon} {recipe.prep_time}m
                                        </Text>
                                    </View>
                                </View>
                                <Text
                                    style={[styles.recipeInstructions, isLocked && styles.recipeInstructionsLocked]}
                                    numberOfLines={2}
                                >
                                    {isLocked ? 'Upgrade to Pro to unlock this recipe...' : recipe.instructions}
                                </Text>
                                <View style={styles.tagRow}>
                                    {recipe.tags.slice(0, 3).map((tag) => (
                                        <View key={tag} style={[styles.tag, isLocked && styles.tagLocked]}>
                                            <Text style={[styles.tagText, isLocked && styles.tagTextLocked]}>{tag}</Text>
                                        </View>
                                    ))}
                                    {isLocked && (
                                        <View style={styles.proTag}>
                                            <Text style={styles.proTagText}>PRO</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Recipe Detail Modal */}
            <Modal
                visible={selectedRecipe !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedRecipe(null)}
            >
                {selectedRecipe && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setSelectedRecipe(null)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>

                            <View style={styles.modalMeta}>
                                <View style={styles.modalMetaItem}>
                                    <Text style={styles.modalMetaIcon}>⏱️</Text>
                                    <Text style={styles.modalMetaText}>{selectedRecipe.prep_time} min</Text>
                                </View>
                                <View style={styles.modalMetaItem}>
                                    <Text style={styles.modalMetaIcon}>{TIER_LABELS[selectedRecipe.tier].icon}</Text>
                                    <Text style={styles.modalMetaText}>{TIER_LABELS[selectedRecipe.tier].name}</Text>
                                </View>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.modalSectionTitle}>Ingredients</Text>
                                {selectedRecipe.ingredients.map((ing, i) => (
                                    <View key={i} style={styles.ingredientRow}>
                                        <Text style={styles.ingredientBullet}>•</Text>
                                        <Text style={styles.ingredientText}>{ing}</Text>
                                    </View>
                                ))}

                                <Text style={styles.modalSectionTitle}>Instructions</Text>
                                <Text style={styles.instructionsText}>{selectedRecipe.instructions}</Text>

                                <View style={styles.modalTags}>
                                    {selectedRecipe.tags.map((tag) => (
                                        <View key={tag} style={styles.modalTag}>
                                            <Text style={styles.modalTagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </Modal>

            {/* Upgrade Modal */}
            <Modal
                visible={showUpgradeModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowUpgradeModal(false)}
            >
                <View style={styles.upgradeOverlay}>
                    <View style={styles.upgradeContent}>
                        <Text style={styles.upgradeEmoji}>🔒</Text>
                        <Text style={styles.upgradeTitle}>Premium Recipe</Text>
                        <Text style={styles.upgradeDescription}>
                            This recipe is part of our {premiumCount}+ premium collection.
                            Upgrade to Pro for lifetime access!
                        </Text>

                        <View style={styles.upgradeBenefits}>
                            <Text style={styles.upgradeBenefit}>✓ All 120+ recipes</Text>
                            <Text style={styles.upgradeBenefit}>✓ No advertisements</Text>
                            <Text style={styles.upgradeBenefit}>✓ Cloud sync</Text>
                            <Text style={styles.upgradeBenefit}>✓ Future updates free</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={() => {
                                setShowUpgradeModal(false);
                                // Navigate to upgrade screen
                                Alert.alert('Coming Soon', 'Payment integration will be added!');
                            }}
                        >
                            <Text style={styles.upgradeButtonText}>Upgrade for ₹299</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.upgradeLater}
                            onPress={() => setShowUpgradeModal(false)}
                        >
                            <Text style={styles.upgradeLaterText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Recipe FAB (Premium Only) */}
            {isPremium && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowAddRecipeModal(true)}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}

            {/* Add Recipe Modal */}
            <Modal
                visible={showAddRecipeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddRecipeModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.addRecipeOverlay}
                >
                    <View style={styles.addRecipeContent}>
                        <View style={styles.addRecipeHeader}>
                            <Text style={styles.addRecipeTitle}>Add Your Recipe</Text>
                            <TouchableOpacity onPress={() => setShowAddRecipeModal(false)}>
                                <Text style={styles.addRecipeClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.addRecipeLabel}>Recipe Name *</Text>
                            <TextInput
                                style={styles.addRecipeInput}
                                placeholder="e.g., Mom's Special Khichdi"
                                placeholderTextColor={colors.neutral.textMuted}
                                value={newRecipeName}
                                onChangeText={setNewRecipeName}
                            />

                            <View style={styles.addRecipeRow}>
                                <View style={styles.addRecipeHalf}>
                                    <Text style={styles.addRecipeLabel}>Prep Time (min)</Text>
                                    <TextInput
                                        style={styles.addRecipeInput}
                                        placeholder="10"
                                        placeholderTextColor={colors.neutral.textMuted}
                                        keyboardType="number-pad"
                                        value={newRecipePrepTime}
                                        onChangeText={setNewRecipePrepTime}
                                    />
                                </View>
                                <View style={styles.addRecipeHalf}>
                                    <Text style={styles.addRecipeLabel}>Servings</Text>
                                    <TextInput
                                        style={styles.addRecipeInput}
                                        placeholder="1"
                                        placeholderTextColor={colors.neutral.textMuted}
                                        keyboardType="number-pad"
                                        value={newRecipeServings}
                                        onChangeText={setNewRecipeServings}
                                    />
                                </View>
                            </View>

                            <Text style={styles.addRecipeLabel}>Ingredients * (one per line)</Text>
                            <TextInput
                                style={[styles.addRecipeInput, styles.addRecipeTextArea]}
                                placeholder="1 cup rice\n1/4 cup dal\n1 tsp turmeric"
                                placeholderTextColor={colors.neutral.textMuted}
                                multiline
                                numberOfLines={4}
                                value={newRecipeIngredients}
                                onChangeText={setNewRecipeIngredients}
                            />

                            <Text style={styles.addRecipeLabel}>Instructions *</Text>
                            <TextInput
                                style={[styles.addRecipeInput, styles.addRecipeTextArea]}
                                placeholder="Wash rice and dal. Add water and turmeric. Pressure cook for 3 whistles..."
                                placeholderTextColor={colors.neutral.textMuted}
                                multiline
                                numberOfLines={5}
                                value={newRecipeInstructions}
                                onChangeText={setNewRecipeInstructions}
                            />

                            <TouchableOpacity
                                style={styles.addRecipeButton}
                                onPress={handleAddRecipe}
                            >
                                <Text style={styles.addRecipeButtonText}>Save Recipe</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
    },
    proBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    proBadgeText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        marginHorizontal: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutral.border,
        marginBottom: spacing.md,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.neutral.textPrimary,
    },
    clearSearch: {
        fontSize: 16,
        color: colors.neutral.textMuted,
        padding: spacing.sm,
    },
    tierFilter: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    tierButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral.surface,
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.xs,
        borderWidth: 2,
        borderColor: colors.neutral.border,
    },
    tierButtonActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    tierIcon: {
        fontSize: 16,
    },
    tierLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
    },
    tierLabelActive: {
        color: '#FFF',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.md,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    categoryCard: {
        width: '47%',
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardActive: {
        borderColor: colors.primary.main,
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    categoryName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    categoryCount: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary.main + '15',
        marginHorizontal: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.lg,
    },
    filterBadgeText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.main,
    },
    filterClear: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
    },
    recipeCard: {
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
    recipeCardLocked: {
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    recipeNameRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    recipeName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginRight: spacing.sm,
    },
    recipeNameLocked: {
        color: colors.neutral.textMuted,
    },
    lockIcon: {
        fontSize: 14,
    },
    tierBadge: {
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    tierBadgeLocked: {
        backgroundColor: '#E8E8E8',
    },
    tierBadgeText: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textSecondary,
    },
    recipeInstructions: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    recipeInstructionsLocked: {
        fontStyle: 'italic',
        color: colors.neutral.textMuted,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.neutral.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
    },
    tagLocked: {
        backgroundColor: '#E8E8E8',
    },
    tagText: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral.textMuted,
    },
    tagTextLocked: {
        color: '#AAAAAA',
    },
    proTag: {
        backgroundColor: '#FFD700',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
    },
    proTagText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.neutral.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        maxHeight: '85%',
    },
    modalClose: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        zIndex: 10,
        padding: spacing.sm,
    },
    modalCloseText: {
        fontSize: 20,
        color: colors.neutral.textMuted,
    },
    modalTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.md,
        paddingRight: spacing['3xl'],
    },
    modalMeta: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.lg,
    },
    modalMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    modalMetaIcon: {
        fontSize: 16,
    },
    modalMetaText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    modalSectionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    ingredientBullet: {
        fontSize: typography.fontSize.base,
        color: colors.primary.main,
        marginRight: spacing.sm,
        fontWeight: typography.fontWeight.bold,
    },
    ingredientText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
    },
    instructionsText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    modalTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    modalTag: {
        backgroundColor: colors.primary.main + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 16,
    },
    modalTagText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.medium,
    },
    // Upgrade modal styles
    upgradeOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    upgradeContent: {
        backgroundColor: colors.neutral.surface,
        borderRadius: 24,
        padding: spacing['2xl'],
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    upgradeEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    upgradeTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.sm,
    },
    upgradeDescription: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textSecondary,
        textAlign: 'center',
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
        marginBottom: spacing.lg,
    },
    upgradeBenefits: {
        alignSelf: 'stretch',
        marginBottom: spacing.xl,
    },
    upgradeBenefit: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.sm,
    },
    upgradeButton: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.md,
        borderRadius: 14,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    upgradeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
    upgradeLater: {
        paddingVertical: spacing.sm,
    },
    upgradeLaterText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
    },
    // FAB Styles
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    fabIcon: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: typography.fontWeight.bold,
    },
    // Add Recipe Modal Styles
    addRecipeOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    addRecipeContent: {
        backgroundColor: colors.neutral.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        paddingBottom: spacing['3xl'],
        maxHeight: '85%',
    },
    addRecipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    addRecipeTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    addRecipeClose: {
        fontSize: 22,
        color: colors.neutral.textMuted,
        padding: spacing.sm,
    },
    addRecipeLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    addRecipeInput: {
        backgroundColor: colors.neutral.background,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.neutral.textPrimary,
        borderWidth: 1,
        borderColor: colors.neutral.border,
    },
    addRecipeRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    addRecipeHalf: {
        flex: 1,
    },
    addRecipeTextArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    addRecipeButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 14,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    addRecipeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
});
