import { Router } from "express";

import {
  addMenuItemRequestDtoSchema,
  editMenuItemRequestDtoSchema,
  getMenuItemsByRestaurantQuerySchema,
  getMenuItemsByIdsRequestDtoSchema,
} from "./schemas/menu-item-rest-schema";
import { menuItemService } from "./services/menu-item-service-impl";

export const menuItemRouter = Router();

menuItemRouter.get("/", async (req, res) => {
  const { restaurantId, available } = getMenuItemsByRestaurantQuerySchema.parse(
    req.query,
  );
  res.json({
    restaurantId,
    items: await menuItemService.getMenuItemsByRestaurant(
      restaurantId,
      available,
    ),
  });
});

menuItemRouter.get("/:id", async (req, res) => {
  res.json(await menuItemService.getMenuItem(req.params.id));
});

menuItemRouter.post("/by-ids", async (req, res) => {
  const request = getMenuItemsByIdsRequestDtoSchema.parse(req.body);
  res.json(await menuItemService.getMenuItemsByIds(request));
});

menuItemRouter.post("/", async (req, res) => {
  const request = addMenuItemRequestDtoSchema.parse(req.body);
  const item = await menuItemService.addMenuItem(request);
  res.status(201).json({ item });
});

menuItemRouter.patch("/:id", async (req, res) => {
  const request = editMenuItemRequestDtoSchema.parse(req.body);
  const item = await menuItemService.editMenuItem(req.params.id, request);
  res.json({ item });
});
