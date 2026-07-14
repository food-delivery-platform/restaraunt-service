import { Router } from "express";

import { requireRestaurantManager } from "../../shared/middlewares/authorization";
import { asyncHandler } from "../../shared/middlewares/async-handler";
import { idPathParametersSchema } from "../../shared/schemas/http-schema";
import { authorizeRestaurantManagement } from "../restaurants/restaurant-authorization";
import {
  addMenuItemRequestDtoSchema,
  editMenuItemRequestDtoSchema,
  getMenuItemsByRestaurantQuerySchema,
  getMenuItemsByIdsRequestDtoSchema,
} from "./schemas/menu-item-rest-schema";
import { validateMenuItemsForOrderRequestDtoSchema } from "./schemas/menu-item-validation-schema";
import { menuItemService } from "./services/menu-item-service-impl";

export const menuItemRouter = Router();

menuItemRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { restaurantId, available } =
      getMenuItemsByRestaurantQuerySchema.parse(req.query);
    res.json({
      restaurantId,
      items: await menuItemService.getMenuItemsByRestaurant(
        restaurantId,
        available,
      ),
    });
  }),
);

menuItemRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idPathParametersSchema.parse(req.params);
    res.json(await menuItemService.getMenuItem(id));
  }),
);

menuItemRouter.post(
  "/by-ids",
  asyncHandler(async (req, res) => {
    const request = getMenuItemsByIdsRequestDtoSchema.parse(req.body);
    res.json(await menuItemService.getMenuItemsByIds(request));
  }),
);

menuItemRouter.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const request = validateMenuItemsForOrderRequestDtoSchema.parse(req.body);
    res.json(await menuItemService.validateMenuItemsForOrder(request));
  }),
);

menuItemRouter.post(
  "/",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const request = addMenuItemRequestDtoSchema.parse(req.body);
    await authorizeRestaurantManagement(req, request.restaurantId);
    const item = await menuItemService.addMenuItem(request);
    res.status(201).json({ item });
  }),
);

menuItemRouter.patch(
  "/:id",
  requireRestaurantManager,
  asyncHandler(async (req, res) => {
    const { id } = idPathParametersSchema.parse(req.params);
    const request = editMenuItemRequestDtoSchema.parse(req.body);
    const currentItem = await menuItemService.getMenuItem(id);
    await authorizeRestaurantManagement(req, currentItem.restaurantId);
    const item = await menuItemService.editMenuItem(id, request);
    res.json({ item });
  }),
);
