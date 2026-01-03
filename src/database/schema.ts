/**
 * RiceBowl Database Schema
 * Complete TypeScript interfaces for all entities
 */

// ===== ENUMS =====
export type TimeTier = 1 | 10 | 30; // Minutes available
export type BowlState = 'full' | 'half' | 'empty' | 'critical';
export type NotificationType = 
  | 'grocery_scan' 
  | 'soak_alert' 
  | 'tea_time' 
  | 'premium_upsell' 
  | 'streak_share'
  | 'system_check';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SocialPlatform = 'whatsapp' | 'instagram' | 'twitter';

// ===== USER =====
export interface User {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
  streak_count: number;
  longest_streak: number;
  timezone: string;
  
  // Preferences
  dietary_restrictions: string[];
  cuisine_preference: 'north_indian' | 'south_indian' | 'eastern_indian' | 'western' | 'mixed';
  rice_preference: boolean; // Eastern India default: true
  
  // Stats
  total_meals_logged: number;
  last_meal_at: Date | null;
  bowl_state: BowlState;
  bowl_last_filled_at: Date | null;
  
  // Settings
  notification_enabled: boolean;
  quiet_hours_start: string; // "22:00"
  quiet_hours_end: string;   // "07:00"
  
  created_at: Date;
  updated_at: Date;
}

// ===== PANTRY ITEM =====
export interface PantryItem {
  id: string;
  user_id: string;
  
  ingredient_name: string;
  category: 'grain' | 'protein' | 'vegetable' | 'dairy' | 'spice' | 'fruit' | 'other';
  quantity: number;
  unit: string; // "kg", "pieces", "cups", etc.
  
  expiry_date: Date | null;
  is_leftover: boolean;
  leftover_from_recipe_id: string | null;
  
  // Soaking requirements
  requires_soaking: boolean;
  soak_hours: number;
  
  added_at: Date;
  updated_at: Date;
}

// ===== RECIPE =====
export interface Recipe {
  id: string;
  name: string;
  description: string;
  
  // Time classification
  time_tier: TimeTier;
  prep_time_minutes: number;
  cook_time_minutes: number;
  
  // Rice Rule flags (critical for Eastern India)
  is_rice_friendly: boolean;  // Can be eaten with rice
  is_wet: boolean;            // Has gravy/curry (pairs well with rice)
  is_dry: boolean;            // Dry dish (needs dal/curry with rice)
  
  // Special filters
  is_deskside: boolean;       // Can eat with one hand
  is_grab_and_go: boolean;    // No cooking required
  is_comfort_food: boolean;   // Good for stress eating
  
  // Content restrictions
  is_premium: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  
  // Recipe details
  ingredients: RecipeIngredient[];
  steps: string[];
  
  // Soaking requirements
  requires_soaking: boolean;
  soak_ingredient: string | null;
  soak_hours: number;
  
  // Metadata
  cuisine: string;
  calories_approx: number;
  protein_approx: number;
  image_url: string | null;
  
  created_at: Date;
  updated_at: Date;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  substitutes: string[];
}

// ===== DAILY PLAN =====
export interface DailyPlan {
  id: string;
  user_id: string;
  date: string; // "YYYY-MM-DD"
  
  // Meal assignments
  breakfast_recipe_id: string | null;
  lunch_recipe_id: string | null;
  dinner_recipe_id: string | null;
  snacks: string[]; // Recipe IDs
  
  // Rice Rule validation
  rice_rule_compliant: boolean;
  rice_rule_auto_added: string | null; // Auto-added dal recipe ID
  
  // Status
  breakfast_completed: boolean;
  lunch_completed: boolean;
  dinner_completed: boolean;
  
  // Eating out handling
  lunch_eating_out: boolean;
  dinner_eating_out: boolean;
  
  // Cook once, eat twice
  cook_extra_for_tomorrow: boolean;
  leftover_recipe_id: string | null;
  
  // Logistics
  grocery_tasks: GroceryTask[];
  prep_tasks: PrepTask[];
  
  created_at: Date;
  updated_at: Date;
}

export interface GroceryTask {
  id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  is_completed: boolean;
  buy_tonight: boolean;
}

export interface PrepTask {
  id: string;
  description: string;
  recipe_id: string;
  scheduled_time: string; // "HH:mm"
  is_soaking: boolean;
  is_completed: boolean;
}

// ===== NOTIFICATION =====
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  
  title: string;
  body: string;
  data: Record<string, unknown>;
  
  scheduled_at: Date;
  sent_at: Date | null;
  read_at: Date | null;
  dismissed_at: Date | null;
  acted_upon: boolean;
  
  // Suppression logic
  suppress_until: Date | null;
  max_per_day: number;
  times_shown_today: number;
  
  // Priority
  is_critical: boolean; // For soak alerts
  is_persistent: boolean; // Keep showing until action
  
  created_at: Date;
}

// ===== SOCIAL SHARE =====
export interface SocialShare {
  id: string;
  user_id: string;
  
  streak_count: number;
  message: string;
  
  platform: SocialPlatform;
  shared_at: Date;
  
  // Referral tracking
  referral_code: string;
  referral_clicks: number;
  referral_conversions: number;
}

// ===== BOWL STATE =====
export interface BowlStatus {
  state: BowlState;
  percentage: number; // 0-100
  last_filled_at: Date | null;
  hours_since_meal: number;
  color: string; // Warm to grey gradient
  is_steaming: boolean;
  next_alert_at: Date | null;
}

// ===== ALGORITHM TYPES =====
export interface SurvivalPlanInput {
  user: User;
  pantryItems: PantryItem[];
  availableRecipes: Recipe[];
  currentDate: string;
  currentTime: string;
}

export interface SurvivalPlanOutput {
  dailyPlan: DailyPlan;
  groceryList: GroceryTask[];
  prepTasks: PrepTask[];
  notifications: Notification[];
  riceRuleViolations: RiceRuleViolation[];
}

export interface RiceRuleViolation {
  meal: MealType;
  recipe_id: string;
  issue: 'dry_without_dal' | 'no_rice_option';
  auto_fix_recipe_id: string | null;
  message: string;
}

// ===== PANIC PANTRY TYPES =====
export interface PanicPantrySuggestion {
  tier: TimeTier;
  recipes: Recipe[];
  tier_label: string;
  tier_description: string;
}

export interface LeftoverLogicInput {
  ingredients: string[]; // 1-2 ingredients
  time_available: TimeTier;
}

export interface LeftoverLogicOutput {
  matching_recipes: Recipe[];
  partial_matches: Recipe[]; // Missing some ingredients
  missing_ingredients: string[];
}
