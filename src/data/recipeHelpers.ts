/**
 * Recipe Data Types and Helpers
 */

export interface Recipe {
    id: string;
    name: string;
    tier: 1 | 2 | 3;
    prep_time: number;
    servings?: number;
    tags: string[];
    ingredients: string[];
    instructions: string;
    tips?: string;
}

// Import the JSON data
import recipesData from './recipes.json';

export const recipes: Recipe[] = recipesData as Recipe[];

// Helper functions
export function getRecipesByTier(tier: 1 | 2 | 3): Recipe[] {
    return recipes.filter(r => r.tier === tier);
}

export function getRecipesByTag(tag: string): Recipe[] {
    return recipes.filter(r => r.tags.includes(tag));
}

export function getDesksideRecipes(): Recipe[] {
    return recipes.filter(r => r.tags.includes('deskside'));
}

export function getHighProteinRecipes(): Recipe[] {
    return recipes.filter(r => r.tags.includes('high-protein'));
}

export function getVeganRecipes(): Recipe[] {
    return recipes.filter(r => r.tags.includes('vegan'));
}

export function getQuickRecipes(maxTime: number = 5): Recipe[] {
    return recipes.filter(r => r.prep_time <= maxTime);
}

export function searchRecipes(query: string): Recipe[] {
    const q = query.toLowerCase();
    return recipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q)) ||
        r.tags.some(t => t.toLowerCase().includes(q))
    );
}

export function getRecipesByIngredients(ingredients: string[]): Recipe[] {
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    return recipes.filter(r =>
        lowerIngredients.some(ing =>
            r.ingredients.some(recipeIng =>
                recipeIng.toLowerCase().includes(ing)
            )
        )
    );
}

// Tier labels
export const TIER_LABELS = {
    1: { name: 'Emergency', icon: '⚡', maxTime: 5, description: 'Grab and go' },
    2: { name: 'Quick Fix', icon: '🍳', maxTime: 15, description: '10-15 minutes' },
    3: { name: 'Comfort', icon: '🍲', maxTime: 30, description: 'Take your time' },
};

// All unique tags
export function getAllTags(): string[] {
    const tags = new Set<string>();
    recipes.forEach(r => r.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
}

// Stats
export const RECIPE_STATS = {
    total: recipes.length,
    tier1: recipes.filter(r => r.tier === 1).length,
    tier2: recipes.filter(r => r.tier === 2).length,
    tier3: recipes.filter(r => r.tier === 3).length,
    vegan: recipes.filter(r => r.tags.includes('vegan')).length,
    vegetarian: recipes.filter(r => r.tags.includes('vegetarian')).length,
    highProtein: recipes.filter(r => r.tags.includes('high-protein')).length,
    deskside: recipes.filter(r => r.tags.includes('deskside')).length,
};

// 30 Best recipes available for FREE users
// Selected for variety: quick options, classics, and essentials
export const FREE_RECIPE_IDS = [
    '1',   // Classic Banana
    '2',   // Peanut Butter Spoon
    '3',   // Handful of Almonds
    '4',   // Roasted Chana
    '7',   // Marie Biscuit & Tea
    '8',   // Boiled Egg
    '10',  // Glass of Milk
    '11',  // Bread Butter
    '15',  // Parle-G
    '20',  // Buttermilk
    '21',  // Peanut Butter Toast
    '23',  // Scrambled Eggs
    '24',  // Maggi Classic
    '25',  // Egg Maggi
    '27',  // Bread Omelette
    '29',  // Cornflakes & Milk
    '33',  // Half Fry
    '36',  // Egg Bhurji
    '41',  // Banana Smoothie
    '48',  // Curd Rice
    '51',  // Khichdi
    '52',  // Egg Fried Rice
    '53',  // Aloo Poha
    '54',  // Upma
    '56',  // Jeera Rice & Dal
    '59',  // Egg Curry
    '77',  // Lassi
    '85',  // Plain Rice & Ghee
    '90',  // Rice & Pickle
    '100', // Warm Water
];

export function isFreeRecipe(recipeId: string): boolean {
    return FREE_RECIPE_IDS.includes(recipeId);
}

export function getFreeRecipes(): Recipe[] {
    return recipes.filter(r => FREE_RECIPE_IDS.includes(r.id));
}

export function getPremiumRecipes(): Recipe[] {
    return recipes.filter(r => !FREE_RECIPE_IDS.includes(r.id));
}
