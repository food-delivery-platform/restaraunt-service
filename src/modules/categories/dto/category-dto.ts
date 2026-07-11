import type { z } from "zod";

import type {
  addCategoriesRequestDtoSchema,
  addCategoryRequestDtoSchema,
  categoryDtoSchema,
} from "../schemas/category-schema";

export type CategoryDto = z.infer<typeof categoryDtoSchema>;

export type AddCategoryRequestDto = z.infer<typeof addCategoryRequestDtoSchema>;

export type AddCategoryResponseDto = {
  category: CategoryDto;
};

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
