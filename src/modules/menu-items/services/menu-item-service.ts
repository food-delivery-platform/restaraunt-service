import type {
  AddMenuItemRequestDto,
  EditMenuItemRequestDto,
  GetMenuItemsByIdsRequestDto,
  GetMenuItemsByIdsResponseDto,
} from "../dto/menu-item-rest-dto";
import type { MenuItemDto } from "../dto/menu-item-dto";
import type {
  ValidateMenuItemsForOrderRequestDto,
  ValidateMenuItemsForOrderResponseDto,
} from "../dto/menu-item-validation-dto";

export type MenuItemAvailabilityFilter = "0" | "1";

export interface MenuItemService {
  getMenuItem(id: MenuItemDto["id"]): Promise<MenuItemDto>;
  getMenuItemsByRestaurant(
    restaurantId: MenuItemDto["restaurantId"],
    available?: MenuItemAvailabilityFilter,
  ): Promise<MenuItemDto[]>;
  getMenuItemsByIds(
    request: GetMenuItemsByIdsRequestDto,
  ): Promise<GetMenuItemsByIdsResponseDto>;
  addMenuItem(request: AddMenuItemRequestDto): Promise<MenuItemDto>;
  editMenuItem(
    id: MenuItemDto["id"],
    request: EditMenuItemRequestDto,
  ): Promise<MenuItemDto>;
  validateMenuItemsForOrder(
    request: ValidateMenuItemsForOrderRequestDto,
  ): Promise<ValidateMenuItemsForOrderResponseDto>;
}
