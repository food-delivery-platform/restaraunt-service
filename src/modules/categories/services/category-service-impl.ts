import { randomUUID } from "node:crypto";

import type { Knex } from "knex";

import { db } from "../../../db/knex";
import { NotFoundError } from "../../../shared/http";
import { firstOrThrow } from "../../../shared/utils";
import { restaurantService } from "../../restaurants/services/restaurant-service-impl";
import type { RestaurantService } from "../../restaurants/services/restaurant-service";
import type {
  AddCategoriesRequestDto,
  AddCategoryRequestDto,
  CategoryDto,
} from "../dto/category-dto";
import type { CategoryEntity } from "../entity/category";
import type { CategoryService } from "./category-service";

class CategoryServiceImpl implements CategoryService {
  public constructor(
    private readonly db: Knex,
    private readonly restaurants: RestaurantService,
  ) {}

  public async getCategoriesByRestaurant(
    restaurantId: CategoryDto["restaurantId"],
  ): Promise<CategoryDto[]> {
    const rows = await this.db<CategoryEntity>("categories")
      .select("*")
      .where({ venue_id: restaurantId })
      .orderBy("name", "asc");

    return rows.map(toCategoryDto);
  }

  public async addCategory(
    request: AddCategoryRequestDto,
  ): Promise<CategoryDto> {
    await this.ensureRestaurantExists(request.restaurantId);

    const row = await this.db<CategoryEntity>("categories")
      .insert({
        id: randomUUID(),
        venue_id: request.restaurantId,
        name: request.name,
      })
      .returning("*")
      .then((rows) => firstOrThrow(rows, "Expected inserted category row"));

    return toCategoryDto(row);
  }

  public async addCategories(
    request: AddCategoriesRequestDto,
  ): Promise<CategoryDto[]> {
    await this.ensureRestaurantExists(request.restaurantId);

    const rowsToInsert = request.names.map((name) => ({
      id: randomUUID(),
      venue_id: request.restaurantId,
      name,
    }));

    const rows = await this.db<CategoryEntity>("categories")
      .insert(rowsToInsert)
      .returning("*");

    return rows.map(toCategoryDto);
  }

  private async ensureRestaurantExists(
    restaurantId: CategoryDto["restaurantId"],
  ): Promise<void> {
    if (!(await this.restaurants.restaurantExists(restaurantId))) {
      throw new NotFoundError("Restaurant not found");
    }
  }
}

const toCategoryDto = (row: CategoryEntity): CategoryDto => ({
  id: row.id,
  restaurantId: row.venue_id,
  name: row.name,
});

export const categoryService: CategoryService = new CategoryServiceImpl(
  db,
  restaurantService,
);
