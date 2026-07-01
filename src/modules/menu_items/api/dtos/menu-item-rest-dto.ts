import { z } from "zod";

import { type MenuItemDto, menuItemDtoSchema } from "./menu-item-dto";

const menuItemIdSchema = menuItemDtoSchema.shape.id;

export type GetMenuItemsByRestaurantResponseDto = {
  restaurantId: MenuItemDto["restaurantId"];
  items: MenuItemDto[];
};

export const getMenuItemsByIdsRequestDtoSchema = z.object({
  menuItemIds: z.array(menuItemIdSchema),
});

export type GetMenuItemsByIdsRequestDto = z.infer<
  typeof getMenuItemsByIdsRequestDtoSchema
>;

export type GetMenuItemsByIdsResponseDto = {
  items: MenuItemDto[];
  unavailableItemIds: MenuItemDto["id"][];
  totalPrice: MenuItemDto["price"];
};

export const addMenuItemRequestDtoSchema = menuItemDtoSchema.omit({
  id: true,
}).extend({
  isAvailable: menuItemDtoSchema.shape.isAvailable.optional(),
});

export type AddMenuItemRequestDto = z.infer<typeof addMenuItemRequestDtoSchema>;

export type AddMenuItemResponseDto = {
  item: MenuItemDto;
};

export const editMenuItemRequestDtoSchema = menuItemDtoSchema.omit({
  id: true,
  restaurantId: true,
}).partial();

export type EditMenuItemRequestDto = z.infer<typeof editMenuItemRequestDtoSchema>;

export type EditMenuItemResponseDto = {
  item: MenuItemDto;
};
