import type { z } from "zod";

import { type RestaurantDto } from "./restaurant-dto";
import type {
  addRestaurantRequestDtoSchema,
  editRestaurantRequestDtoSchema,
} from "../schemas/restaurant-rest-schema";

export type GetRestaurantsResponseDto = {
  restaurants: RestaurantDto[];
};

export type GetRestaurantResponseDto = {
  restaurant: RestaurantDto;
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
