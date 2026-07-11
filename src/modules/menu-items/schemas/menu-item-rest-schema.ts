import { z } from "zod";

import { menuItemDtoSchema } from "./menu-item-schema";

const menuItemIdSchema = menuItemDtoSchema.shape.id;

export const getMenuItemsByRestaurantQuerySchema = z.object({
  restaurantId: menuItemDtoSchema.shape.restaurantId,
  available: z.enum(["0", "1"]).optional(),
});

export const getMenuItemsByIdsRequestDtoSchema = z.object({
  menuItemIds: z.array(menuItemIdSchema),
});

export const addMenuItemRequestDtoSchema = menuItemDtoSchema
  .omit({
    id: true,
  })
  .extend({
    isAvailable: menuItemDtoSchema.shape.isAvailable.optional(),
  });

export const editMenuItemRequestDtoSchema = menuItemDtoSchema
  .omit({
    id: true,
    restaurantId: true,
  })
  .partial();
