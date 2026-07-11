import { Router } from "express";

import {
  addCategoriesRequestDtoSchema,
  addCategoryRequestDtoSchema,
  getCategoriesByRestaurantQuerySchema,
} from "./schemas/category-schema";
import { categoryService } from "./services/category-service-impl";

export const categoryRouter = Router();

categoryRouter.get("/", async (req, res) => {
  const { restaurantId } = getCategoriesByRestaurantQuerySchema.parse(
    req.query,
  );
  res.json({
    restaurantId,
    categories: await categoryService.getCategoriesByRestaurant(restaurantId),
  });
});

categoryRouter.post("/", async (req, res) => {
  const request = addCategoryRequestDtoSchema.parse(req.body);
  const category = await categoryService.addCategory(request);
  res.status(201).json({ category });
});

categoryRouter.post("/batch", async (req, res) => {
  const request = addCategoriesRequestDtoSchema.parse(req.body);
  const categories = await categoryService.addCategories(request);
  res.status(201).json({ categories });
});
