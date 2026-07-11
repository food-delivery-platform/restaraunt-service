import { restaurantDtoSchema } from "./restaurant-schema";

export const addRestaurantRequestDtoSchema = restaurantDtoSchema
  .omit({
    id: true,
    rating: true,
    address: true,
    openingHours: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    isOpen: restaurantDtoSchema.shape.isOpen.optional(),
    cuisineTags: restaurantDtoSchema.shape.cuisineTags.optional(),
  });

export const editRestaurantRequestDtoSchema = restaurantDtoSchema
  .omit({
    id: true,
    ownerId: true,
    addressId: true,
    address: true,
    rating: true,
    openingHours: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
