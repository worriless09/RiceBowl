/**
 * Pantry Manager - Connected to Global State
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { useAppState, PantryItem } from '../../store/AppStore';
import { colors, spacing, typography } from '../../config/theme';

// Common pantry item icons
const ITEM_ICONS = [
    { icon: '🍚', name: 'Rice/Grain' },
    { icon: '🥚', name: 'Eggs' },
    { icon: '🥛', name: 'Dairy' },
    { icon: '🍞', name: 'Bread' },
    { icon: '🧅', name: 'Vegetables' },
    { icon: '🍎', name: 'Fruits' },
    { icon: '🛢️', name: 'Oil' },
    { icon: '🌶️', name: 'Spices' },
    { icon: '🥜', name: 'Nuts/Protein' },
    { icon: '🍜', name: 'Noodles' },
    { icon: '🧈', name: 'Butter/Ghee' },
    { icon: '📦', name: 'Other' },
];

// Quick add options
const QUICK_ADD_OPTIONS = [
    { name: 'Rice', icon: '🍚', quantity: '1 kg', status: 'good' as const },
    { name: 'Eggs', icon: '🥚', quantity: '6 pcs', status: 'good' as const },
    { name: 'Milk', icon: '🥛', quantity: '1 L', status: 'good' as const },
    { name: 'Bread', icon: '🍞', quantity: '1 pack', status: 'good' as const },
    { name: 'Onion', icon: '🧅', quantity: '500g', status: 'good' as const },
    { name: 'Oil', icon: '🛢️', quantity: '1 L', status: 'good' as const },
];

type FilterType = 'all' | 'expiring' | 'low' | 'empty';

export function PantryManager() {
    const { state, addPantryItem, updatePantryItem, removePantryItem } = useAppState();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New item form state
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemIcon, setNewItemIcon] = useState('📦');

    const filterItems = (items: PantryItem[]) => {
        let filtered = items;

        if (filter === 'expiring') {
            filtered = items.filter(i => i.status === 'expiring');
        } else if (filter === 'low') {
            filtered = items.filter(i => i.status === 'low' || i.status === 'empty');
        } else if (filter === 'empty') {
            filtered = items.filter(i => i.status === 'empty');
        }

        if (searchQuery) {
            filtered = filtered.filter(i =>
                i.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredItems = filterItems(state.pantryItems);
    const expiringCount = state.pantryItems.filter(i => i.status === 'expiring').length;
    const emptyCount = state.pantryItems.filter(i => i.status === 'empty').length;

    const handleQuickAdd = (item: typeof QUICK_ADD_OPTIONS[0]) => {
        addPantryItem({
            name: item.name,
            icon: item.icon,
            quantity: item.quantity,
            status: item.status,
            daysLeft: null,
        });
    };

    const handleAddNewItem = () => {
        if (!newItemName.trim()) return;

        addPantryItem({
            name: newItemName.trim(),
            icon: newItemIcon,
            quantity: newItemQuantity.trim() || '1 unit',
            status: 'good',
            daysLeft: null,
        });

        // Reset form and close modal
        setNewItemName('');
        setNewItemQuantity('');
        setNewItemIcon('📦');
        setShowAddModal(false);
    };

    const handleRemoveItem = (id: string) => {
        removePantryItem(id);
    };

    const handleToggleStatus = (item: PantryItem) => {
        const statusCycle: PantryItem['status'][] = ['good', 'low', 'expiring', 'empty'];
        const currentIndex = statusCycle.indexOf(item.status);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        updatePantryItem(item.id, { status: nextStatus });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Pantry</Text>
                <Text style={styles.subtitle}>Track your ingredients</Text>
            </View>

            {/* Alert Badges */}
            <View style={styles.alertBadges}>
                {expiringCount > 0 && (
                    <TouchableOpacity
                        style={[styles.alertBadge, styles.alertExpiring]}
                        onPress={() => setFilter(filter === 'expiring' ? 'all' : 'expiring')}
                    >
                        <Text style={styles.alertBadgeText}>⚠️ {expiringCount} expiring soon</Text>
                    </TouchableOpacity>
                )}
                {emptyCount > 0 && (
                    <TouchableOpacity
                        style={[styles.alertBadge, styles.alertEmpty]}
                        onPress={() => setFilter(filter === 'empty' ? 'all' : 'empty')}
                    >
                        <Text style={styles.alertBadgeText}>🚨 {emptyCount} out of stock</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search pantry..."
                    placeholderTextColor={colors.neutral.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearSearch}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                {(['all', 'expiring', 'low', 'empty'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
                {/* Pantry Items */}
                {filteredItems.map((item) => (
                    <PantryItemCard
                        key={item.id}
                        item={item}
                        onToggleStatus={() => handleToggleStatus(item)}
                        onRemove={() => handleRemoveItem(item.id)}
                    />
                ))}

                {filteredItems.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No items match your search' : 'No items in this category'}
                        </Text>
                    </View>
                )}

                {/* Quick Add Section */}
                <View style={styles.quickAddSection}>
                    <Text style={styles.quickAddTitle}>Quick Add</Text>
                    <View style={styles.quickAddGrid}>
                        {QUICK_ADD_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.quickAddButton}
                                onPress={() => handleQuickAdd(item)}
                            >
                                <Text style={styles.quickAddIcon}>{item.icon}</Text>
                                <Text style={styles.quickAddName}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Add Item FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddModal(true)}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Add Item Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Pantry Item</Text>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Item Name Input */}
                        <Text style={styles.inputLabel}>Item Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., Rice, Eggs, Milk..."
                            placeholderTextColor={colors.neutral.textMuted}
                            value={newItemName}
                            onChangeText={setNewItemName}
                            autoFocus
                        />

                        {/* Quantity Input */}
                        <Text style={styles.inputLabel}>Quantity</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., 1 kg, 500g, 2 packets..."
                            placeholderTextColor={colors.neutral.textMuted}
                            value={newItemQuantity}
                            onChangeText={setNewItemQuantity}
                        />

                        {/* Icon Selection */}
                        <Text style={styles.inputLabel}>Category Icon</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
                            <View style={styles.iconGrid}>
                                {ITEM_ICONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.icon}
                                        style={[
                                            styles.iconOption,
                                            newItemIcon === item.icon && styles.iconOptionSelected
                                        ]}
                                        onPress={() => setNewItemIcon(item.icon)}
                                    >
                                        <Text style={styles.iconOptionEmoji}>{item.icon}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Add Button */}
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                !newItemName.trim() && styles.addButtonDisabled
                            ]}
                            onPress={handleAddNewItem}
                            disabled={!newItemName.trim()}
                        >
                            <Text style={styles.addButtonText}>Add to Pantry</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

interface PantryItemCardProps {
    item: PantryItem;
    onToggleStatus: () => void;
    onRemove: () => void;
}

function PantryItemCard({ item, onToggleStatus, onRemove }: PantryItemCardProps) {
    const getStatusStyle = () => {
        switch (item.status) {
            case 'expiring': return styles.statusExpiring;
            case 'low': return styles.statusLow;
            case 'empty': return styles.statusEmpty;
            default: return styles.statusGood;
        }
    };

    const getStatusLabel = () => {
        switch (item.status) {
            case 'expiring': return `⚠️ ${item.daysLeft || 2}d left`;
            case 'low': return '📉 Running low';
            case 'empty': return '🚨 Out of stock';
            default: return item.daysLeft ? `✓ ${item.daysLeft}d left` : '✓ Stocked';
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.itemCard, item.status === 'empty' && styles.itemCardEmpty]}
        >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity}</Text>
            </View>
            <TouchableOpacity
                style={[styles.itemStatus, getStatusStyle()]}
                onPress={onToggleStatus}
            >
                <Text style={styles.itemStatusText}>{getStatusLabel()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Text style={styles.removeButtonText}>✕</Text>
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
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        marginTop: spacing.xs,
    },
    alertBadges: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        marginBottom: spacing.md,
        flexWrap: 'wrap',
    },
    alertBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
    },
    alertExpiring: {
        backgroundColor: '#FFF3E0',
    },
    alertEmpty: {
        backgroundColor: '#FFEBEE',
    },
    alertBadgeText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral.textSecondary,
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
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    filterTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: colors.neutral.surface,
    },
    filterTabActive: {
        backgroundColor: colors.primary.main,
    },
    filterTabText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral.textSecondary,
    },
    filterTabTextActive: {
        color: '#FFF',
    },
    list: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.sm,
    },
    itemCardEmpty: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: colors.critical.light,
    },
    itemIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textPrimary,
    },
    itemQuantity: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textMuted,
        marginTop: 2,
    },
    itemStatus: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        marginRight: spacing.sm,
    },
    statusGood: {
        backgroundColor: '#E8F5E9',
    },
    statusExpiring: {
        backgroundColor: '#FFF3E0',
    },
    statusLow: {
        backgroundColor: '#FFF8E1',
    },
    statusEmpty: {
        backgroundColor: '#FFEBEE',
    },
    itemStatusText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral.textSecondary,
    },
    removeButton: {
        padding: spacing.sm,
    },
    removeButtonText: {
        fontSize: 14,
        color: colors.neutral.textMuted,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral.textMuted,
        textAlign: 'center',
    },
    quickAddSection: {
        marginTop: spacing.xl,
        marginBottom: spacing['4xl'],
    },
    quickAddTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
        marginBottom: spacing.md,
    },
    quickAddGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    quickAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.neutral.border,
        gap: spacing.xs,
    },
    quickAddIcon: {
        fontSize: 16,
    },
    quickAddName: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
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
    // Modal Styles
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
        paddingBottom: spacing['3xl'],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.textPrimary,
    },
    modalClose: {
        padding: spacing.sm,
    },
    modalCloseText: {
        fontSize: 20,
        color: colors.neutral.textMuted,
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    textInput: {
        backgroundColor: colors.neutral.background,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.neutral.textPrimary,
        borderWidth: 1,
        borderColor: colors.neutral.border,
    },
    iconScrollView: {
        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },
    iconGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconOptionSelected: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.light + '20',
    },
    iconOptionEmoji: {
        fontSize: 24,
    },
    addButton: {
        backgroundColor: colors.primary.main,
        borderRadius: 14,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    addButtonDisabled: {
        backgroundColor: colors.neutral.textMuted,
        opacity: 0.5,
    },
    addButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFF',
    },
});
