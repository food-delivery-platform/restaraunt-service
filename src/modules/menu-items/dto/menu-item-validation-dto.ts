import type { z } from "zod";

import { type MenuItemDto } from "./menu-item-dto";
import type { validateMenuItemsForOrderRequestDtoSchema } from "../schemas/menu-item-validation-schema";

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

export type MenuValidationErrorCode =
  | "ITEM_NOT_FOUND"
  | "ITEM_UNAVAILABLE"
  | "ITEM_RESTAURANT_MISMATCH"
  | "PRICE_CHANGED"
  | "INVALID_QUANTITY"
  | "CURRENCY_MISMATCH";

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
