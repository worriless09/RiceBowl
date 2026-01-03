/**
 * Rice Rule Validator
 * 
 * Core constraint: Prevents culturally inappropriate meal suggestions
 * For Eastern India users, rice + dry sabzi WITHOUT dal/curry is invalid
 */

import { DailyPlan, Recipe, User, RiceRuleViolation, MealType } from '../database/schema';

interface RiceRuleValidationResult {
    isValid: boolean;
    violations: RiceRuleViolation[];
}

interface AutoFixResult {
    fixApplied: boolean;
    addedRecipeId: string | null;
    message: string;
}

/**
 * Validate that the daily plan follows the Rice Rule
 * 
 * The Rule: If a meal contains rice AND a dry dish (sabzi),
 * there MUST be a wet dish (dal, curry) to accompany it.
 */
export function validateRiceRule(
    plan: DailyPlan,
    recipes: Recipe[],
    user: User
): RiceRuleValidationResult {
    // Skip validation for non-rice-preference users
    if (!user.rice_preference) {
        return { isValid: true, violations: [] };
    }

    const violations: RiceRuleViolation[] = [];
    const recipeMap = new Map(recipes.map(r => [r.id, r]));

    // Check each meal
    const mealsToCheck: { type: MealType; recipeId: string | null }[] = [
        { type: 'lunch', recipeId: plan.lunch_recipe_id },
        { type: 'dinner', recipeId: plan.dinner_recipe_id },
    ];

    for (const meal of mealsToCheck) {
        if (!meal.recipeId) continue;

        const recipe = recipeMap.get(meal.recipeId);
        if (!recipe) continue;

        // Check if this is a rice-friendly recipe
        if (recipe.is_rice_friendly && recipe.is_dry && !recipe.is_wet) {
            // This is a dry dish meant to go with rice
            // Check if there's a wet accompaniment
            const hasWetDish = checkForWetDish(plan, recipeMap, meal.type);

            if (!hasWetDish) {
                violations.push({
                    meal: meal.type,
                    recipe_id: meal.recipeId,
                    issue: 'dry_without_dal',
                    auto_fix_recipe_id: null, // Will be set by autoFix
                    message: `${recipe.name} is a dry dish. Add dal or curry for a complete meal with rice.`,
                });
            }
        }
    }

    return {
        isValid: violations.length === 0,
        violations,
    };
}

/**
 * Check if there's already a wet dish in the meal
 */
function checkForWetDish(
    plan: DailyPlan,
    recipeMap: Map<string, Recipe>,
    mealType: MealType
): boolean {
    // Check snacks and auto-added items for wet dishes
    const autoAdded = plan.rice_rule_auto_added;
    if (autoAdded) {
        const recipe = recipeMap.get(autoAdded);
        if (recipe?.is_wet) return true;
    }

    // In a full implementation, we'd check side dishes too
    return false;
}

/**
 * Auto-fix Rice Rule violations by suggesting dal/curry
 */
export function autoFixRiceRule(
    violations: RiceRuleViolation[],
    availableRecipes: Recipe[]
): AutoFixResult {
    if (violations.length === 0) {
        return {
            fixApplied: false,
            addedRecipeId: null,
            message: 'No violations to fix',
        };
    }

    // Find quick wet dishes (dal/curry)
    const wetDishes = availableRecipes.filter(r =>
        r.is_wet &&
        !r.is_premium &&
        r.time_tier <= 30
    );

    // Prioritize quick dals
    const quickDals = wetDishes.filter(r =>
        r.name.toLowerCase().includes('dal') ||
        r.name.toLowerCase().includes('curry') ||
        r.name.toLowerCase().includes('sambar')
    ).sort((a, b) => a.time_tier - b.time_tier);

    if (quickDals.length > 0) {
        const selectedDal = quickDals[0];

        // Update violations with the fix
        violations.forEach(v => {
            v.auto_fix_recipe_id = selectedDal.id;
        });

        return {
            fixApplied: true,
            addedRecipeId: selectedDal.id,
            message: `Added ${selectedDal.name} to complete the meal`,
        };
    }

    return {
        fixApplied: false,
        addedRecipeId: null,
        message: 'No suitable dal/curry found. Please add one manually.',
    };
}

/**
 * Get suggestions for wet dishes to pair with a dry dish
 */
export function suggestWetDishes(
    dryRecipe: Recipe,
    availableRecipes: Recipe[],
    pantryItems: string[]
): Recipe[] {
    const wetDishes = availableRecipes.filter(r => r.is_wet && !r.is_premium);

    // Score by ingredient availability
    const scored = wetDishes.map(recipe => {
        const availableCount = recipe.ingredients.filter(ing =>
            pantryItems.some(p => p.toLowerCase() === ing.name.toLowerCase())
        ).length;

        const totalRequired = recipe.ingredients.filter(i => !i.is_optional).length;
        const score = availableCount / totalRequired;

        return { recipe, score };
    });

    // Return top 3 suggestions
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => s.recipe);
}

/**
 * Check if a specific recipe combination is valid
 */
export function isValidCombination(
    mainRecipe: Recipe,
    sideRecipe: Recipe | null,
    includesRice: boolean
): boolean {
    // If no rice, any combination is valid
    if (!includesRice) return true;

    // If main is wet, valid
    if (mainRecipe.is_wet) return true;

    // If main is dry, need a wet side
    if (mainRecipe.is_dry) {
        if (!sideRecipe) return false;
        return sideRecipe.is_wet;
    }

    return true;
}
