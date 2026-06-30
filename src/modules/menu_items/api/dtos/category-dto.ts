import { z } from "zod";

const idSchema = z.string().min(1);

export const categoryDtoSchema = z.object({
  id: idSchema,
  restaurantId: idSchema,
  name: z.string().min(1),
});

export type CategoryDto = z.infer<typeof categoryDtoSchema>;

export const addCategoryRequestDtoSchema = z.object({
  restaurantId: idSchema,
  name: z.string().min(1),
});

export type AddCategoryRequestDto = z.infer<typeof addCategoryRequestDtoSchema>;

const addCategoryResponseDtoSchema = z.object({
  category: categoryDtoSchema,
});

export type AddCategoryResponseDto = z.infer<typeof addCategoryResponseDtoSchema>;

export const addCategoriesRequestDtoSchema = z.object({
  restaurantId: idSchema,
  names: z.array(z.string().min(1)).min(1),
});

export type AddCategoriesRequestDto = z.infer<
  typeof addCategoriesRequestDtoSchema
>;

const addCategoriesResponseDtoSchema = z.object({
  categories: z.array(categoryDtoSchema),
});

export type AddCategoriesResponseDto = z.infer<
  typeof addCategoriesResponseDtoSchema
>;

const getCategoriesByRestaurantResponseDtoSchema = z.object({
  restaurantId: idSchema,
  categories: z.array(categoryDtoSchema),
});

export type GetCategoriesByRestaurantResponseDto = z.infer<
  typeof getCategoriesByRestaurantResponseDtoSchema
>;
