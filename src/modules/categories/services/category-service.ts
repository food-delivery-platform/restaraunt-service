import type {
  AddCategoriesRequestDto,
  AddCategoryRequestDto,
  CategoryDto,
} from "../dto/category-dto";

export interface CategoryService {
  getCategoriesByRestaurant(
    restaurantId: CategoryDto["restaurantId"],
  ): Promise<CategoryDto[]>;
  addCategory(request: AddCategoryRequestDto): Promise<CategoryDto>;
  addCategories(request: AddCategoriesRequestDto): Promise<CategoryDto[]>;
}
