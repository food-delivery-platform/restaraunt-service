import { z } from "zod";

import { menuItemDtoSchema } from "./menu-item-schema";

const menuItemIdSchema = menuItemDtoSchema.shape.id;
const restaurantIdSchema = menuItemDtoSchema.shape.restaurantId;
const priceSchema = menuItemDtoSchema.shape.price;

const validateMenuItemsForOrderItemRequestDtoSchema = z.object({
  menuItemId: menuItemIdSchema,
  quantity: z.number().int().positive(),
  expectedPrice: priceSchema,
  currency: z.string(),
});

export const validateMenuItemsForOrderRequestDtoSchema = z.object({
  restaurantId: restaurantIdSchema,
  items: z.array(validateMenuItemsForOrderItemRequestDtoSchema),
});
