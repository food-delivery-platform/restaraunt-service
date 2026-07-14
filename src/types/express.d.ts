import type { RestaurantJwtPayload } from "../shared/types/restaurant-jwt-payload";

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: RestaurantJwtPayload;
    }
  }
}

export {};
