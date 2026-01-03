/**
 * RiceBowl Survival Algorithm Engine
 * 
 * Priority Hierarchy:
 * 1. Check for leftovers (9 PM trigger)
 * 2. Lunch planning (eating out + cook once, eat twice)
 * 3. Dinner selection (Rice-First with expiry priority)
 * 4. Rice Rule validation (auto-add Dal if dry)
 * 5. Generate logistics (grocery vs prep tasks)
 */

import {
    User,
    Recipe,
    PantryItem,
    DailyPlan,
    GroceryTask,
    PrepTask,
    Notification,
    RiceRuleViolation,
    SurvivalPlanInput,
    SurvivalPlanOutput,
    MealType,
    TimeTier,
} from '../database/schema';
import { validateRiceRule, autoFixRiceRule } from './riceRuleValidator';
import { calculateSoakReminder } from './soakingCalculator';
import { generateNotification } from '../services/notifications/generator';

/**
 * Main entry point for the Survival Algorithm
 * Generates a complete daily plan with logistics
 */
export function generateSurvivalPlan(input: SurvivalPlanInput): SurvivalPlanOutput {
    const { user, pantryItems, availableRecipes, currentDate, currentTime } = input;

    // Initialize output
    const dailyPlan: DailyPlan = createEmptyPlan(user.id, currentDate);
    const groceryList: GroceryTask[] = [];
    const prepTasks: PrepTask[] = [];
    const notifications: Notification[] = [];
    const riceRuleViolations: RiceRuleViolation[] = [];

    // Step 1: Check for leftovers (9 PM trigger)
    const leftovers = checkLeftovers(pantryItems, currentTime);
    if (leftovers.hasLeftovers) {
        dailyPlan.lunch_recipe_id = leftovers.suggestedUpgrade?.id || null;
        dailyPlan.leftover_recipe_id = leftovers.originalRecipeId || null;
    }

    // Step 2: Plan lunch
    if (!dailyPlan.lunch_recipe_id) {
        const lunchPlan = planLunch(user, pantryItems, availableRecipes);
        dailyPlan.lunch_recipe_id = lunchPlan.recipeId;
        dailyPlan.lunch_eating_out = lunchPlan.eatingOut;
        dailyPlan.cook_extra_for_tomorrow = lunchPlan.cookExtra;
    }

    // Step 3: Select dinner (Rice-First with expiry priority)
    const dinnerPlan = selectDinner(user, pantryItems, availableRecipes, dailyPlan);
    dailyPlan.dinner_recipe_id = dinnerPlan.recipeId;

    // Step 4: Validate Rice Rule
    const riceValidation = validateRiceRule(dailyPlan, availableRecipes, user);
    if (!riceValidation.isValid) {
        riceRuleViolations.push(...riceValidation.violations);

        // Auto-fix by adding dal/curry
        const autoFix = autoFixRiceRule(riceValidation.violations, availableRecipes);
        if (autoFix.fixApplied) {
            dailyPlan.rice_rule_auto_added = autoFix.addedRecipeId;
            dailyPlan.rice_rule_compliant = true;
        }
    } else {
        dailyPlan.rice_rule_compliant = true;
    }

    // Step 5: Generate logistics
    const logistics = generateLogistics(dailyPlan, availableRecipes, pantryItems, currentTime);
    groceryList.push(...logistics.groceryTasks);
    prepTasks.push(...logistics.prepTasks);
    notifications.push(...logistics.notifications);

    return {
        dailyPlan,
        groceryList,
        prepTasks,
        notifications,
        riceRuleViolations,
    };
}

/**
 * Step 1: Check for leftovers with upgrade logic
 */
interface LeftoverCheckResult {
    hasLeftovers: boolean;
    originalRecipeId: string | null;
    suggestedUpgrade: Recipe | null;
    upgradeDescription: string | null;
}

function checkLeftovers(pantryItems: PantryItem[], currentTime: string): LeftoverCheckResult {
    // Trigger at 9 PM
    const hour = parseInt(currentTime.split(':')[0]);
    const isNinePM = hour === 21;

    // Filter items marked as leftovers
    const leftoverItems = pantryItems.filter(item => item.is_leftover);

    if (leftoverItems.length === 0 || !isNinePM) {
        return {
            hasLeftovers: false,
            originalRecipeId: null,
            suggestedUpgrade: null,
            upgradeDescription: null,
        };
    }

    // Find upgrade recipes based on leftovers
    const upgrades: Record<string, { recipe: string; description: string }> = {
        'rice': { recipe: 'fried_rice', description: 'Transform leftover rice into quick fried rice' },
        'dal': { recipe: 'dal_tadka', description: 'Reheat with fresh tadka for enhanced flavor' },
        'roti': { recipe: 'roti_wrap', description: 'Make wraps with available fillings' },
        'vegetables': { recipe: 'stir_fry', description: 'Quick stir-fry with fresh aromatics' },
    };

    // Return first available upgrade
    for (const item of leftoverItems) {
        const upgrade = upgrades[item.ingredient_name.toLowerCase()];
        if (upgrade) {
            return {
                hasLeftovers: true,
                originalRecipeId: item.leftover_from_recipe_id,
                suggestedUpgrade: null, // Will be resolved from recipe DB
                upgradeDescription: upgrade.description,
            };
        }
    }

    return {
        hasLeftovers: true,
        originalRecipeId: leftoverItems[0].leftover_from_recipe_id,
        suggestedUpgrade: null,
        upgradeDescription: 'Use up leftovers to prevent waste',
    };
}

/**
 * Step 2: Plan lunch with eating out and cook-extra logic
 */
interface LunchPlanResult {
    recipeId: string | null;
    eatingOut: boolean;
    cookExtra: boolean;
}

function planLunch(
    user: User,
    pantryItems: PantryItem[],
    recipes: Recipe[]
): LunchPlanResult {
    // Default: Find a 10-minute tier recipe
    const quickRecipes = recipes.filter(r => r.time_tier === 10 && !r.is_premium);

    // Check for items expiring soon
    const expiringItems = pantryItems.filter(item => {
        if (!item.expiry_date) return false;
        const daysUntilExpiry = Math.ceil(
            (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 2;
    });

    // Prioritize recipes using expiring ingredients
    if (expiringItems.length > 0) {
        const prioritizedRecipe = quickRecipes.find(recipe =>
            recipe.ingredients.some(ing =>
                expiringItems.some(exp => exp.ingredient_name.toLowerCase() === ing.name.toLowerCase())
            )
        );

        if (prioritizedRecipe) {
            return {
                recipeId: prioritizedRecipe.id,
                eatingOut: false,
                cookExtra: prioritizedRecipe.time_tier >= 30, // Cook extra for longer recipes
            };
        }
    }

    // Default to first available quick recipe
    return {
        recipeId: quickRecipes[0]?.id || null,
        eatingOut: false,
        cookExtra: false,
    };
}

/**
 * Step 3: Select dinner with Rice-First priority
 */
interface DinnerPlanResult {
    recipeId: string | null;
    isRiceBased: boolean;
}

function selectDinner(
    user: User,
    pantryItems: PantryItem[],
    recipes: Recipe[],
    currentPlan: DailyPlan
): DinnerPlanResult {
    // Rice-First: Prioritize rice-friendly recipes for Eastern India users
    let candidateRecipes = recipes;

    if (user.rice_preference) {
        // Filter for rice-friendly recipes
        candidateRecipes = recipes.filter(r => r.is_rice_friendly);
    }

    // Further filter by time tier (prefer 30-min comfort food for dinner)
    const comfortRecipes = candidateRecipes.filter(r => r.time_tier === 30 && r.is_comfort_food);

    // Check pantry for available ingredients
    const pantryIngredients = pantryItems.map(p => p.ingredient_name.toLowerCase());

    // Find recipes where we have most ingredients
    const scoredRecipes = comfortRecipes.map(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ing =>
            pantryIngredients.includes(ing.name.toLowerCase())
        ).length;

        const totalRequired = recipe.ingredients.filter(i => !i.is_optional).length;
        const score = matchingIngredients / totalRequired;

        return { recipe, score };
    }).sort((a, b) => b.score - a.score);

    // Return best match
    const bestMatch = scoredRecipes[0];
    return {
        recipeId: bestMatch?.recipe.id || candidateRecipes[0]?.id || null,
        isRiceBased: bestMatch?.recipe.is_rice_friendly || false,
    };
}

/**
 * Step 5: Generate logistics (grocery & prep tasks)
 */
interface LogisticsResult {
    groceryTasks: GroceryTask[];
    prepTasks: PrepTask[];
    notifications: Notification[];
}

function generateLogistics(
    plan: DailyPlan,
    recipes: Recipe[],
    pantryItems: PantryItem[],
    currentTime: string
): LogisticsResult {
    const groceryTasks: GroceryTask[] = [];
    const prepTasks: PrepTask[] = [];
    const notifications: Notification[] = [];

    // Get all recipes in the plan
    const plannedRecipeIds = [
        plan.breakfast_recipe_id,
        plan.lunch_recipe_id,
        plan.dinner_recipe_id,
        plan.rice_rule_auto_added,
    ].filter(Boolean) as string[];

    const plannedRecipes = recipes.filter(r => plannedRecipeIds.includes(r.id));

    // Collect all required ingredients
    const requiredIngredients: Map<string, { quantity: number; unit: string }> = new Map();

    for (const recipe of plannedRecipes) {
        for (const ing of recipe.ingredients) {
            if (ing.is_optional) continue;

            const existing = requiredIngredients.get(ing.name.toLowerCase());
            if (existing) {
                existing.quantity += ing.quantity;
            } else {
                requiredIngredients.set(ing.name.toLowerCase(), {
                    quantity: ing.quantity,
                    unit: ing.unit,
                });
            }
        }
    }

    // Check against pantry
    const pantryMap = new Map(
        pantryItems.map(p => [p.ingredient_name.toLowerCase(), p])
    );

    for (const [ingredient, required] of requiredIngredients) {
        const inPantry = pantryMap.get(ingredient);

        // Safely parse pantry quantity to number (handles string or number)
        const pantryQuantity = Number(inPantry?.quantity) || 0;

        if (!inPantry || pantryQuantity < required.quantity) {
            const needed = required.quantity - pantryQuantity;
            groceryTasks.push({
                id: `grocery_${ingredient}_${Date.now()}`,
                ingredient,
                quantity: needed,
                unit: required.unit,
                is_completed: false,
                buy_tonight: true, // Flag for "buy tonight" vs "buy tomorrow"
            });
        }
    }

    // Check for soaking requirements
    for (const recipe of plannedRecipes) {
        if (recipe.requires_soaking && recipe.soak_ingredient) {
            const soakTime = calculateSoakReminder(
                recipe.soak_hours,
                'dinner', // Assume dinner for now
                currentTime
            );

            prepTasks.push({
                id: `prep_soak_${recipe.id}`,
                description: `Soak ${recipe.soak_ingredient} for ${recipe.soak_hours} hours`,
                recipe_id: recipe.id,
                scheduled_time: soakTime.reminderTime,
                is_soaking: true,
                is_completed: false,
            });

            // Generate soak notification
            notifications.push(
                generateNotification('soak_alert', {
                    ingredient: recipe.soak_ingredient,
                    hours: recipe.soak_hours,
                    scheduledTime: soakTime.reminderTime,
                })
            );
        }
    }

    return { groceryTasks, prepTasks, notifications };
}

/**
 * Create empty plan template
 */
function createEmptyPlan(userId: string, date: string): DailyPlan {
    return {
        id: `plan_${userId}_${date}`,
        user_id: userId,
        date,
        breakfast_recipe_id: null,
        lunch_recipe_id: null,
        dinner_recipe_id: null,
        snacks: [],
        rice_rule_compliant: false,
        rice_rule_auto_added: null,
        breakfast_completed: false,
        lunch_completed: false,
        dinner_completed: false,
        lunch_eating_out: false,
        dinner_eating_out: false,
        cook_extra_for_tomorrow: false,
        leftover_recipe_id: null,
        grocery_tasks: [],
        prep_tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
    };
}
