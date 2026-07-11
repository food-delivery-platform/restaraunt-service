import type { MenuItemDto } from "../dto/menu-item-dto";

export type MenuItemEntity = {
  id: string;
  venue_id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  price: string;
  currency: string;
  is_active: boolean;
  allergens?: string[] | null;
  labels?: MenuItemDto["labels"] | null;
  portions?: MenuItemDto["portion"] | null;
  spicy_level?: MenuItemDto["spicyLevel"] | null;
  nutrition?: MenuItemDto["nutrition"] | null;
};

export type MenuItemWithCategoryEntity = MenuItemEntity & {
  category_name?: string | null;
  category_venue_id?: string | null;
};
