import type { z } from "zod";

import { type MenuItemDto } from "./menu-item-dto";
import type {
  addMenuItemRequestDtoSchema,
  editMenuItemRequestDtoSchema,
  getMenuItemsByIdsRequestDtoSchema,
} from "../schemas/menu-item-rest-schema";

export type GetMenuItemsByRestaurantResponseDto = {
  restaurantId: MenuItemDto["restaurantId"];
  items: MenuItemDto[];
};

export type GetMenuItemsByIdsRequestDto = z.infer<
  typeof getMenuItemsByIdsRequestDtoSchema
>;

export type GetMenuItemsByIdsResponseDto = {
  items: MenuItemDto[];
  unavailableItemIds: MenuItemDto["id"][];
  totalPrice: MenuItemDto["price"];
};

export type AddMenuItemRequestDto = z.infer<typeof addMenuItemRequestDtoSchema>;

export type AddMenuItemResponseDto = {
  item: MenuItemDto;
};

export type EditMenuItemRequestDto = z.infer<
  typeof editMenuItemRequestDtoSchema
>;

export type EditMenuItemResponseDto = {
  item: MenuItemDto;
};
