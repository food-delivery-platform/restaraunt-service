import { randomUUID } from "node:crypto";

import type { Knex } from "knex";

import { db } from "../../../shared/db/knex";
import { HttpError, NotFoundError } from "../../../shared/http";
import { firstOrThrow, multiplyPrice, sumPrices } from "../../../shared/utils";
import type { CategoryDto } from "../../categories/dto/category-dto";
import { restaurantService } from "../../restaurants/services/restaurant-service-impl";
import type { RestaurantService } from "../../restaurants/services/restaurant-service";
import type { MenuItemDto } from "../dto/menu-item-dto";
import type {
  AddMenuItemRequestDto,
  EditMenuItemRequestDto,
  GetMenuItemsByIdsRequestDto,
  GetMenuItemsByIdsResponseDto,
} from "../dto/menu-item-rest-dto";
import type {
  MenuValidationErrorDto,
  ValidateMenuItemsForOrderRequestDto,
  ValidateMenuItemsForOrderResponseDto,
  ValidatedOrderMenuItemDto,
} from "../dto/menu-item-validation-dto";
import type {
  MenuItemEntity,
  MenuItemWithCategoryEntity,
} from "../entity/menu-item";
import type {
  MenuItemAvailabilityFilter,
  MenuItemService,
} from "./menu-item-service";

class MenuItemServiceImpl implements MenuItemService {
  public constructor(
    private readonly db: Knex,
    private readonly restaurants: RestaurantService,
  ) {}

  public async getMenuItem(id: MenuItemDto["id"]): Promise<MenuItemDto> {
    const row = await this.menuItemsQuery().where("menu_items.id", id).first();

    if (row === undefined) {
      throw new NotFoundError("Menu item not found");
    }

    return toMenuItemDto(row);
  }

  public async getMenuItemsByRestaurant(
    restaurantId: MenuItemDto["restaurantId"],
    available?: MenuItemAvailabilityFilter,
  ): Promise<MenuItemDto[]> {
    const query = this.menuItemsQuery()
      .where("menu_items.venue_id", restaurantId)
      .orderBy("menu_items.name", "asc");

    if (available) {
      query.andWhere("menu_items.is_active", available === "1");
    }

    return (await query).map(toMenuItemDto);
  }

  public async getMenuItemsByIds(
    request: GetMenuItemsByIdsRequestDto,
  ): Promise<GetMenuItemsByIdsResponseDto> {
    const requestedIds = Array.from(new Set(request.menuItemIds));
    const rows = await this.findRowsByIds(requestedIds);
    const availableRows = rows.filter((row) => row.is_active);
    const availableIds = new Set(availableRows.map((row) => row.id));

    return {
      items: availableRows.map(toMenuItemDto),
      unavailableItemIds: request.menuItemIds.filter(
        (id) => !availableIds.has(id),
      ),
      totalPrice: sumPrices(availableRows.map((row) => row.price)),
    };
  }

  public async addMenuItem(
    request: AddMenuItemRequestDto,
  ): Promise<MenuItemDto> {
    await this.ensureRestaurantExists(request.restaurantId);
    if (request.category !== undefined) {
      await this.ensureCategoryBelongsToRestaurant(
        request.category.id,
        request.restaurantId,
      );
    }

    const row = await this.db<MenuItemEntity>("menu_items")
      .insert({
        id: randomUUID(),
        venue_id: request.restaurantId,
        name: request.name,
        price: request.price,
        currency: request.currency,
        is_active: request.isAvailable ?? true,
        ...(request.description !== undefined
          ? { description: request.description }
          : {}),
        ...(request.category !== undefined
          ? { category_id: request.category.id }
          : {}),
        ...(request.allergens !== undefined
          ? { allergens: request.allergens }
          : {}),
        ...(request.labels !== undefined ? { labels: request.labels } : {}),
        ...(request.portion !== undefined ? { portions: request.portion } : {}),
        ...(request.spicyLevel !== undefined
          ? { spicy_level: request.spicyLevel }
          : {}),
        ...(request.nutrition !== undefined
          ? { nutrition: request.nutrition }
          : {}),
      })
      .returning("id")
      .then((rows) => firstOrThrow(rows, "Expected inserted menu item row"));

    return this.getMenuItem(row.id);
  }

  public async editMenuItem(
    id: MenuItemDto["id"],
    request: EditMenuItemRequestDto,
  ): Promise<MenuItemDto> {
    if (request.category !== undefined) {
      const currentItem = await this.getMenuItem(id);
      await this.ensureCategoryBelongsToRestaurant(
        request.category.id,
        currentItem.restaurantId,
      );
    }

    const row = await this.db<MenuItemEntity>("menu_items")
      .where({ id })
      .update({
        ...(request.name !== undefined ? { name: request.name } : {}),
        ...(request.description !== undefined
          ? { description: request.description }
          : {}),
        ...(request.category !== undefined
          ? { category_id: request.category.id }
          : {}),
        ...(request.price !== undefined ? { price: request.price } : {}),
        ...(request.currency !== undefined
          ? { currency: request.currency }
          : {}),
        ...(request.isAvailable !== undefined
          ? { is_active: request.isAvailable }
          : {}),
        ...(request.allergens !== undefined
          ? { allergens: request.allergens }
          : {}),
        ...(request.labels !== undefined ? { labels: request.labels } : {}),
        ...(request.portion !== undefined ? { portions: request.portion } : {}),
        ...(request.spicyLevel !== undefined
          ? { spicy_level: request.spicyLevel }
          : {}),
        ...(request.nutrition !== undefined
          ? { nutrition: request.nutrition }
          : {}),
      })
      .returning("id")
      .then(firstOrNotFound);

    return this.getMenuItem(row.id);
  }

  public async validateMenuItemsForOrder(
    request: ValidateMenuItemsForOrderRequestDto,
  ): Promise<ValidateMenuItemsForOrderResponseDto> {
    const rowsById = new Map(
      (
        await this.findRowsByIds(request.items.map((item) => item.menuItemId))
      ).map((row) => [row.id, row]),
    );
    const validItems: ValidatedOrderMenuItemDto[] = [];
    const errors: MenuValidationErrorDto[] = [];

    for (const item of request.items) {
      const row = rowsById.get(item.menuItemId);
      const itemErrors = validateOrderItem(item, row, request.restaurantId);

      errors.push(...itemErrors);

      if (row !== undefined && itemErrors.length === 0) {
        validItems.push({
          menuItemId: row.id,
          restaurantId: row.venue_id,
          name: row.name,
          quantity: item.quantity,
          price: row.price,
          currency: row.currency,
          totalPrice: multiplyPrice(row.price, item.quantity),
        });
      }
    }

    return {
      valid: errors.length === 0,
      restaurantId: request.restaurantId,
      items: validItems,
      totalPrice: sumPrices(validItems.map((item) => item.totalPrice)),
      currency: validItems[0]?.currency ?? request.items[0]?.currency ?? "",
      errors,
    };
  }

  private menuItemsQuery() {
    return this.db<MenuItemEntity>("menu_items")
      .leftJoin("categories", "categories.id", "menu_items.category_id")
      .select<MenuItemWithCategoryEntity[]>([
        "menu_items.*",
        "categories.name as category_name",
        "categories.venue_id as category_venue_id",
      ]);
  }

  private async findRowsByIds(
    ids: MenuItemDto["id"][],
  ): Promise<MenuItemWithCategoryEntity[]> {
    return ids.length === 0
      ? []
      : await this.menuItemsQuery().whereIn("menu_items.id", ids);
  }

  private async ensureRestaurantExists(
    restaurantId: MenuItemDto["restaurantId"],
  ): Promise<void> {
    if (!(await this.restaurants.restaurantExists(restaurantId))) {
      throw new NotFoundError("Restaurant not found");
    }
  }

  private async ensureCategoryBelongsToRestaurant(
    categoryId: CategoryDto["id"],
    restaurantId: CategoryDto["restaurantId"],
  ): Promise<void> {
    const category = await this.db("categories")
      .select("id")
      .where({ id: categoryId, venue_id: restaurantId })
      .first();

    if (category === undefined) {
      throw new HttpError(403, "Category access denied");
    }
  }
}

const firstOrNotFound = <T>(rows: T[]): T => {
  const row = rows[0];
  if (row === undefined) {
    throw new NotFoundError("Menu item not found");
  }

  return row;
};

const validateOrderItem = (
  item: ValidateMenuItemsForOrderRequestDto["items"][number],
  row: MenuItemWithCategoryEntity | undefined,
  restaurantId: string,
): MenuValidationErrorDto[] => {
  if (row === undefined) {
    return [
      {
        menuItemId: item.menuItemId,
        code: "ITEM_NOT_FOUND",
        message: "Menu item was not found",
      },
    ];
  }

  const errors: MenuValidationErrorDto[] = [];

  if (item.quantity <= 0) {
    errors.push({
      menuItemId: item.menuItemId,
      code: "INVALID_QUANTITY",
      message: "Quantity must be greater than zero",
    });
  }

  if (!row.is_active) {
    errors.push({
      menuItemId: item.menuItemId,
      code: "ITEM_UNAVAILABLE",
      message: "Menu item is unavailable",
    });
  }

  if (row.venue_id !== restaurantId) {
    errors.push({
      menuItemId: item.menuItemId,
      code: "ITEM_RESTAURANT_MISMATCH",
      message: "Menu item does not belong to the restaurant",
    });
  }

  if (row.price !== item.expectedPrice) {
    errors.push({
      menuItemId: item.menuItemId,
      code: "PRICE_CHANGED",
      message: "Menu item price changed",
      currentPrice: row.price,
      expectedPrice: item.expectedPrice,
    });
  }

  if (row.currency !== item.currency) {
    errors.push({
      menuItemId: item.menuItemId,
      code: "CURRENCY_MISMATCH",
      message: "Menu item currency changed",
    });
  }

  return errors;
};

const toMenuItemDto = (row: MenuItemWithCategoryEntity): MenuItemDto => ({
  id: row.id,
  restaurantId: row.venue_id,
  name: row.name,
  category: toCategoryDto(row),
  price: row.price,
  currency: row.currency,
  isAvailable: row.is_active,
  ...(row.description !== null && row.description !== undefined
    ? { description: row.description }
    : {}),
  ...(row.allergens !== null && row.allergens !== undefined
    ? { allergens: row.allergens }
    : {}),
  ...(row.labels !== null && row.labels !== undefined
    ? { labels: row.labels }
    : {}),
  ...(row.portions !== null && row.portions !== undefined
    ? { portion: row.portions }
    : {}),
  ...(row.spicy_level !== null && row.spicy_level !== undefined
    ? { spicyLevel: row.spicy_level }
    : {}),
  ...(row.nutrition !== null && row.nutrition !== undefined
    ? { nutrition: row.nutrition }
    : {}),
});

const toCategoryDto = (
  row: MenuItemWithCategoryEntity,
): CategoryDto | undefined => {
  if (
    row.category_id === null ||
    row.category_id === undefined ||
    row.category_name === null ||
    row.category_name === undefined ||
    row.category_venue_id === null ||
    row.category_venue_id === undefined
  ) {
    return undefined;
  }

  return {
    id: row.category_id,
    restaurantId: row.category_venue_id,
    name: row.category_name,
  };
};

export const menuItemService: MenuItemService = new MenuItemServiceImpl(
  db,
  restaurantService,
);
