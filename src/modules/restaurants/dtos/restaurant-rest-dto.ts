import type { z } from "zod";

import { type RestaurantDto, restaurantDtoSchema } from "./restaurant-dto";

export type GetRestaurantsResponseDto = {
  restaurants: RestaurantDto[];
};

export const addRestaurantRequestDtoSchema = restaurantDtoSchema
  .omit({
    id: true,
    rating: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    isOpen: restaurantDtoSchema.shape.isOpen.optional(),
  });

export type AddRestaurantRequestDto = z.infer<
  typeof addRestaurantRequestDtoSchema
>;

export type AddRestaurantResponseDto = {
  restaurant: RestaurantDto;
};

export const editRestaurantRequestDtoSchema = restaurantDtoSchema
  .omit({
    id: true,
    ownerId: true,
    addressId: true,
    rating: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type EditRestaurantRequestDto = z.infer<
  typeof editRestaurantRequestDtoSchema
>;

export type EditRestaurantResponseDto = {
  restaurant: RestaurantDto;
};
