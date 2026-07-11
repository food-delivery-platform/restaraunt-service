import { Router } from "express";

import {
  addRestaurantRequestDtoSchema,
  editRestaurantRequestDtoSchema,
} from "./schemas/restaurant-rest-schema";
import { restaurantService } from "./services/restaurant-service-impl";

export const restaurantRouter = Router();

restaurantRouter.get("/", async (_req, res) => {
  res.json({ restaurants: await restaurantService.getRestaurants() });
});

restaurantRouter.get("/:id", async (req, res) => {
  const restaurant = await restaurantService.getRestaurant(req.params.id);
  res.json({ restaurant });
});

restaurantRouter.post("/", async (req, res) => {
  const request = addRestaurantRequestDtoSchema.parse(req.body);
  const restaurant = await restaurantService.addRestaurant(request);
  res.status(201).json({ restaurant });
});

restaurantRouter.patch("/:id", async (req, res) => {
  const request = editRestaurantRequestDtoSchema.parse(req.body);
  const restaurant = await restaurantService.editRestaurant(
    req.params.id,
    request,
  );
  res.json({ restaurant });
});
