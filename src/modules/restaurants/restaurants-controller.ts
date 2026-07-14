import { Router } from "express";

import {
  getAuthenticatedSubject,
  requireRestaurantManager,
} from "../../shared/middlewares/authorization";
import { asyncHandler } from "../../shared/middlewares/async-handler";
import { idPathParametersSchema } from "../../shared/schemas/http-schema";
import { categoryService } from "../categories/services/category-service-impl";
import { menuItemService } from "../menu-items/services/menu-item-service-impl";
import { authorizeRestaurantManagement } from "./restaurant-authorization";
import {
  addRestaurantRequestDtoSchema,
  editRestaurantRequestDtoSchema,
} from "./schemas/restaurant-rest-schema";
import { restaurantService } from "./services/restaurant-service-impl";

export const restaurantRouter = Router();

restaurantRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ restaurants: await restaurantService.getRestaurants() });
  }),
);

restaurantRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idPathParametersSchema.parse(req.params);
    const restaurant = await restaurantService.getRestaurant(id);
    const [categories, menuItems] = await Promise.all([
      categoryService.getCategoriesByRestaurant(restaurant.id),
      menuItemService.getMenuItemsByRestaurant(restaurant.id),
    ]);

    res.json({ restaurant: { ...restaurant, categories, menuItems } });
  }),
);

restaurantRouter.post(
  "/",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const request = addRestaurantRequestDtoSchema.parse(req.body);
    const restaurant = await restaurantService.addRestaurant(
      getAuthenticatedSubject(req),
      request,
    );
    res.status(201).json({ restaurant });
  }),
);

restaurantRouter.patch(
  "/:id",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const { id } = idPathParametersSchema.parse(req.params);
    const request = editRestaurantRequestDtoSchema.parse(req.body);
    await authorizeRestaurantManagement(req, id);
    const restaurant = await restaurantService.editRestaurant(id, request);
    res.json({ restaurant });
  }),
);
