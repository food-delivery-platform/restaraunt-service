import type { Category } from "./category";

export type SpicyLevel = 0 | 1 | 2 | 3;

export type MenuItemLabels = {
  spicy?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  kosher?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  halal?: boolean;
};

export type MenuItemPortion = {
  weightGrams?: number;
  volumeMl?: number;
  pieces?: number;
  description?: string;
};

export type MenuItemNutrition = {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
};

export type MenuItem = {
  id: string;
  restaurantId: string;

  name: string;
  description?: string;
  category?: Category;

  price: string;
  currency: string;

  isAvailable: boolean;

  ingredients?: string[];
  allergens?: string[];

  labels?: MenuItemLabels;
  portion?: MenuItemPortion;
  spicyLevel?: SpicyLevel;
  nutrition?: MenuItemNutrition;
};
