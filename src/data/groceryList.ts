/**
 * Grocery List System for RiceBowl
 * Static comprehensive list + dynamic generation from pantry
 */

import { recipes, Recipe } from './recipeHelpers';

// Comprehensive grocery categories with all ingredients
export const GROCERY_CATEGORIES = {
    'pantry-staples': {
        name: 'Pantry Staples',
        icon: '🏪',
        items: [
            { name: 'Rice (Basmati/Regular)', quantity: '2 kg', essential: true },
            { name: 'Atta (Whole Wheat Flour)', quantity: '1 kg', essential: true },
            { name: 'Dal - Toor/Arhar', quantity: '500g', essential: true },
            { name: 'Dal - Moong', quantity: '500g', essential: false },
            { name: 'Dal - Chana', quantity: '500g', essential: false },
            { name: 'Besan (Gram Flour)', quantity: '500g', essential: true },
            { name: 'Rava/Semolina', quantity: '500g', essential: true },
            { name: 'Poha (Flattened Rice)', quantity: '500g', essential: true },
            { name: 'Maida', quantity: '250g', essential: false },
            { name: 'Oats', quantity: '500g', essential: false },
            { name: 'Vermicelli/Semiya', quantity: '200g', essential: false },
            { name: 'Pasta/Macaroni', quantity: '500g', essential: false },
            { name: 'Maggi Noodles', quantity: '8 packets', essential: true },
            { name: 'Bread (White/Brown)', quantity: '1 loaf', essential: true },
            { name: 'Cornflakes/Muesli', quantity: '500g', essential: false },
            { name: 'Sabudana', quantity: '250g', essential: false },
            { name: 'Dalia (Broken Wheat)', quantity: '500g', essential: false },
        ]
    },
    'dairy-eggs': {
        name: 'Dairy & Eggs',
        icon: '🥛',
        items: [
            { name: 'Milk (Full Cream/Toned)', quantity: '2L/week', essential: true },
            { name: 'Curd/Dahi', quantity: '500g', essential: true },
            { name: 'Butter', quantity: '100g', essential: true },
            { name: 'Ghee', quantity: '200g', essential: true },
            { name: 'Paneer', quantity: '200g', essential: false },
            { name: 'Cheese Slices', quantity: '10 slices', essential: false },
            { name: 'Eggs', quantity: '12 eggs', essential: true },
            { name: 'Cream', quantity: '100ml', essential: false },
        ]
    },
    'vegetables': {
        name: 'Fresh Vegetables',
        icon: '🥬',
        items: [
            { name: 'Onion', quantity: '1 kg', essential: true },
            { name: 'Tomato', quantity: '500g', essential: true },
            { name: 'Potato', quantity: '1 kg', essential: true },
            { name: 'Green Chili', quantity: '100g', essential: true },
            { name: 'Garlic', quantity: '100g', essential: true },
            { name: 'Ginger', quantity: '50g', essential: true },
            { name: 'Coriander Leaves', quantity: '1 bunch', essential: true },
            { name: 'Curry Leaves', quantity: '1 sprig', essential: false },
            { name: 'Mint Leaves', quantity: '1 bunch', essential: false },
            { name: 'Cucumber', quantity: '2 pieces', essential: false },
            { name: 'Carrot', quantity: '250g', essential: false },
            { name: 'Capsicum', quantity: '2 pieces', essential: false },
            { name: 'Cabbage', quantity: '1 small', essential: false },
            { name: 'Cauliflower', quantity: '1 small', essential: false },
            { name: 'Beans', quantity: '250g', essential: false },
            { name: 'Peas (Fresh/Frozen)', quantity: '200g', essential: false },
            { name: 'Spinach/Palak', quantity: '1 bunch', essential: false },
            { name: 'Lemon', quantity: '6 pieces', essential: true },
        ]
    },
    'fruits': {
        name: 'Fruits',
        icon: '🍎',
        items: [
            { name: 'Banana', quantity: '6 pieces', essential: true },
            { name: 'Apple', quantity: '4 pieces', essential: false },
            { name: 'Orange/Mosambi', quantity: '4 pieces', essential: false },
            { name: 'Dates (Khajoor)', quantity: '200g', essential: false },
            { name: 'Avocado', quantity: '2 pieces', essential: false },
        ]
    },
    'spices-condiments': {
        name: 'Spices & Condiments',
        icon: '🌶️',
        items: [
            { name: 'Salt', quantity: '1 kg', essential: true },
            { name: 'Black Pepper', quantity: '50g', essential: true },
            { name: 'Turmeric Powder', quantity: '100g', essential: true },
            { name: 'Red Chili Powder', quantity: '100g', essential: true },
            { name: 'Cumin Seeds (Jeera)', quantity: '100g', essential: true },
            { name: 'Cumin Powder', quantity: '50g', essential: true },
            { name: 'Coriander Powder', quantity: '100g', essential: true },
            { name: 'Mustard Seeds', quantity: '50g', essential: true },
            { name: 'Garam Masala', quantity: '50g', essential: true },
            { name: 'Chaat Masala', quantity: '50g', essential: true },
            { name: 'Kitchen King Masala', quantity: '50g', essential: false },
            { name: 'Pav Bhaji Masala', quantity: '50g', essential: false },
            { name: 'Soy Sauce', quantity: '200ml', essential: false },
            { name: 'Vinegar', quantity: '200ml', essential: false },
            { name: 'Tomato Ketchup', quantity: '500g', essential: false },
            { name: 'Green Chutney', quantity: '100g', essential: false },
            { name: 'Pickle (Any)', quantity: '200g', essential: true },
        ]
    },
    'oils-fats': {
        name: 'Oils & Cooking Fats',
        icon: '🫒',
        items: [
            { name: 'Refined Oil/Sunflower Oil', quantity: '1L', essential: true },
            { name: 'Mustard Oil', quantity: '500ml', essential: false },
            { name: 'Olive Oil', quantity: '250ml', essential: false },
            { name: 'Coconut Oil', quantity: '200ml', essential: false },
        ]
    },
    'proteins-nuts': {
        name: 'Proteins & Nuts',
        icon: '🥜',
        items: [
            { name: 'Peanut Butter', quantity: '250g', essential: true },
            { name: 'Almonds', quantity: '200g', essential: true },
            { name: 'Walnuts', quantity: '100g', essential: false },
            { name: 'Cashews', quantity: '100g', essential: false },
            { name: 'Peanuts (Raw)', quantity: '250g', essential: true },
            { name: 'Roasted Chana', quantity: '500g', essential: true },
            { name: 'Soya Chunks', quantity: '200g', essential: false },
            { name: 'Sprouts', quantity: '200g', essential: false },
            { name: 'Sattu Powder', quantity: '250g', essential: false },
        ]
    },
    'beverages': {
        name: 'Beverages',
        icon: '☕',
        items: [
            { name: 'Tea (Loose/Bags)', quantity: '250g', essential: true },
            { name: 'Coffee Powder', quantity: '100g', essential: false },
            { name: 'Green Tea', quantity: '25 bags', essential: false },
            { name: 'Sugar', quantity: '1 kg', essential: true },
            { name: 'Honey', quantity: '250g', essential: false },
            { name: 'Jaggery (Gud)', quantity: '250g', essential: false },
        ]
    },
    'snacks': {
        name: 'Ready Snacks',
        icon: '🍪',
        items: [
            { name: 'Parle-G/Marie Biscuits', quantity: '4 packets', essential: true },
            { name: 'Dark Chocolate', quantity: '1 bar', essential: false },
            { name: 'Puffed Rice (Muri)', quantity: '500g', essential: false },
            { name: 'Sev/Bhujia', quantity: '200g', essential: false },
            { name: 'Popcorn Kernels', quantity: '200g', essential: false },
            { name: 'Papad', quantity: '10 pieces', essential: false },
            { name: 'Jam (Mixed Fruit)', quantity: '200g', essential: false },
        ]
    }
};

export type GroceryCategory = keyof typeof GROCERY_CATEGORIES;
export type GroceryItem = {
    name: string;
    quantity: string;
    essential: boolean;
};

/**
 * Get all essential items that form the minimum pantry
 */
export function getEssentialGroceries(): { category: string; items: GroceryItem[] }[] {
    return Object.entries(GROCERY_CATEGORIES).map(([key, category]) => ({
        category: category.name,
        icon: category.icon,
        items: category.items.filter(item => item.essential)
    })).filter(cat => cat.items.length > 0);
}

/**
 * Get grocery list for specific recipes
 */
export function getGroceriesForRecipes(recipeIds: string[]): string[] {
    const selectedRecipes = recipes.filter(r => recipeIds.includes(r.id));
    const allIngredients = new Set<string>();

    selectedRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
            // Extract the main ingredient name (remove quantities)
            const cleanName = ing.replace(/^\d+[\d\/\s]*\w*\s*/i, '').split('(')[0].trim();
            allIngredients.add(cleanName);
        });
    });

    return Array.from(allIngredients).sort();
}

/**
 * Get full grocery list (all items)
 */
export function getFullGroceryList(): { category: string; icon: string; items: GroceryItem[] }[] {
    return Object.entries(GROCERY_CATEGORIES).map(([_, category]) => ({
        category: category.name,
        icon: category.icon,
        items: category.items
    }));
}

/**
 * Calculate missing items based on current pantry
 */
export function getMissingGroceries(pantryItems: string[]): GroceryItem[] {
    const allEssentials = Object.values(GROCERY_CATEGORIES)
        .flatMap(cat => cat.items.filter(item => item.essential));

    const pantryLower = pantryItems.map(p => p.toLowerCase());

    return allEssentials.filter(item =>
        !pantryLower.some(p => item.name.toLowerCase().includes(p))
    );
}

export default GROCERY_CATEGORIES;
