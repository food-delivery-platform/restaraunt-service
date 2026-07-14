import { Router } from "express";

import { requireRestaurantManager } from "../../shared/middlewares/authorization";
import { asyncHandler } from "../../shared/middlewares/async-handler";
import { authorizeRestaurantManagement } from "../restaurants/restaurant-authorization";
import {
  addCategoriesRequestDtoSchema,
  addCategoryRequestDtoSchema,
  getCategoriesByRestaurantQuerySchema,
} from "./schemas/category-schema";
import { categoryService } from "./services/category-service-impl";

export const categoryRouter = Router();

categoryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { restaurantId } = getCategoriesByRestaurantQuerySchema.parse(
      req.query,
    );
    res.json({
      restaurantId,
      categories: await categoryService.getCategoriesByRestaurant(restaurantId),
    });
  }),
);

categoryRouter.post(
  "/",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const request = addCategoryRequestDtoSchema.parse(req.body);
    await authorizeRestaurantManagement(req, request.restaurantId);
    const category = await categoryService.addCategory(request);
    res.status(201).json({ category });
  }),
);

categoryRouter.post(
  "/batch",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const request = addCategoriesRequestDtoSchema.parse(req.body);
    await authorizeRestaurantManagement(req, request.restaurantId);
    const categories = await categoryService.addCategories(request);
    res.status(201).json({ categories });
  }),
);
