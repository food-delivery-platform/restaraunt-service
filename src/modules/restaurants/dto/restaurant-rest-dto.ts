import type { z } from "zod";

import type { CategoryDto } from "../../categories/dto/category-dto";
import type { MenuItemDto } from "../../menu-items/dto/menu-item-dto";
import { type RestaurantDto } from "./restaurant-dto";
import type {
  addRestaurantRequestDtoSchema,
  editRestaurantRequestDtoSchema,
} from "../schemas/restaurant-rest-schema";

export type GetRestaurantsResponseDto = {
  restaurants: RestaurantDto[];
};

export type GetRestaurantResponseDto = {
  restaurant: RestaurantDetailsDto;
};

export type RestaurantDetailsDto = RestaurantDto & {
  categories: CategoryDto[];
  menuItems: MenuItemDto[];
};

export type AddRestaurantRequestDto = z.infer<
  typeof addRestaurantRequestDtoSchema
>;

export type AddRestaurantResponseDto = {
  restaurant: RestaurantDto;
};

export type EditRestaurantRequestDto = z.infer<
  typeof editRestaurantRequestDtoSchema
>;

export type EditRestaurantResponseDto = {
  restaurant: RestaurantDto;
};
