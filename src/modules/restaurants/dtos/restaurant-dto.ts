import { z } from "zod";

const idSchema = z.string().min(1);

export const restaurantDtoSchema = z.object({
  id: idSchema,
  ownerId: idSchema,
  addressId: idSchema,

  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),

  isOpen: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  imageUrl: z.string().url().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RestaurantDto = z.infer<typeof restaurantDtoSchema>;
