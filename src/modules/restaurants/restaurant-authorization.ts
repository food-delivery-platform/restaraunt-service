import type { Request } from "express";

import { getAuthenticatedSubject } from "../../shared/middlewares/authorization";
import { HttpError } from "../../shared/http";
import type { RestaurantDto } from "./dto/restaurant-dto";
import { restaurantService } from "./services/restaurant-service-impl";

export const authorizeRestaurantManagement = async (
  req: Request,
  restaurantId: RestaurantDto["id"],
): Promise<void> => {
  const canManageRestaurant = await restaurantService.restaurantBelongsToOwner(
    restaurantId,
    getAuthenticatedSubject(req),
  );

  if (!canManageRestaurant) {
    throw new HttpError(403, "Restaurant access denied");
  }
};
