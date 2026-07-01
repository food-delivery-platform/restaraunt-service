import { z } from "zod";

import { type MenuItemDto, menuItemDtoSchema } from "./menu-item-dto";

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

export type ValidateMenuItemsForOrderRequestDto = z.infer<
  typeof validateMenuItemsForOrderRequestDtoSchema
>;

export type ValidatedOrderMenuItemDto = {
  menuItemId: MenuItemDto["id"];
  restaurantId: MenuItemDto["restaurantId"];

  name: MenuItemDto["name"];
  quantity: number;

  price: MenuItemDto["price"];
  currency: MenuItemDto["currency"];

  totalPrice: MenuItemDto["price"];
};

const menuValidationErrorCodes = [
  "ITEM_NOT_FOUND",
  "ITEM_UNAVAILABLE",
  "ITEM_RESTAURANT_MISMATCH",
  "PRICE_CHANGED",
  "INVALID_QUANTITY",
  "CURRENCY_MISMATCH",
] as const;

export type MenuValidationErrorCode =
  (typeof menuValidationErrorCodes)[number];

export type MenuValidationErrorDto = {
  menuItemId?: MenuItemDto["id"];

  code: MenuValidationErrorCode;
  message: string;

  currentPrice?: MenuItemDto["price"];
  expectedPrice?: MenuItemDto["price"];
};

export type ValidateMenuItemsForOrderResponseDto = {
  valid: boolean;

  restaurantId: MenuItemDto["restaurantId"];

  items: ValidatedOrderMenuItemDto[];

  totalPrice: MenuItemDto["price"];
  currency: MenuItemDto["currency"];

  errors: MenuValidationErrorDto[];
};
