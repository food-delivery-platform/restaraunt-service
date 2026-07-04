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

export type AddCategoryResponseDto = {
  category: CategoryDto;
};

export const addCategoriesRequestDtoSchema = z.object({
  restaurantId: idSchema,
  names: z.array(z.string().min(1)).min(1),
});

export type AddCategoriesRequestDto = z.infer<
  typeof addCategoriesRequestDtoSchema
>;

export type AddCategoriesResponseDto = {
  categories: CategoryDto[];
};

export type GetCategoriesByRestaurantResponseDto = {
  restaurantId: CategoryDto["restaurantId"];
  categories: CategoryDto[];
};
