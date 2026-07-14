import { z } from "zod";

import { idSchema } from "../../../shared/schemas/http-schema";
import { categoryDtoSchema } from "../../categories/schemas/category-schema";

const priceSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, {
  message: "Price must be a decimal string with up to 2 decimal places",
});

const menuItemLabelsDtoSchema = z.object({
  spicy: z.boolean().optional(),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  kosher: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  lactoseFree: z.boolean().optional(),
  halal: z.boolean().optional(),
});

const menuItemPortionDtoSchema = z.object({
  weightGrams: z.number().int().positive().optional(),
  volumeMl: z.number().int().positive().optional(),
  pieces: z.number().int().positive().optional(),
  description: z.string().optional(),
});

const menuItemNutritionDtoSchema = z.object({
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
});

const spicyLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const menuItemDtoSchema = z.object({
  id: idSchema,
  restaurantId: idSchema,

  name: z.string(),
  description: z.string().optional(),
  category: categoryDtoSchema.optional(),

  price: priceSchema,
  currency: z.string(),

  isAvailable: z.boolean(),

  allergens: z.array(z.string()).optional(),

  labels: menuItemLabelsDtoSchema.optional(),
  portion: menuItemPortionDtoSchema.optional(),
  spicyLevel: spicyLevelSchema.optional(),
  nutrition: menuItemNutritionDtoSchema.optional(),
});
