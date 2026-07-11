import { z } from "zod";

const idSchema = z.string().min(1);

export const categoryDtoSchema = z.object({
  id: idSchema,
  restaurantId: idSchema,
  name: z.string().min(1),
});

export const getCategoriesByRestaurantQuerySchema = z.object({
  restaurantId: idSchema,
});

export const addCategoryRequestDtoSchema = z.object({
  restaurantId: idSchema,
  name: z.string().min(1),
});

export const addCategoriesRequestDtoSchema = z.object({
  restaurantId: idSchema,
  names: z.array(z.string().min(1)).min(1),
});
