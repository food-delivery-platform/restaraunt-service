import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../http";
import type { RestaurantJwtPayload } from "../types/restaurant-jwt-payload";

const getGroup = (environmentName: string, fallback: string): string =>
  process.env[environmentName]?.trim() || fallback;

const requireAnyGroup =
  (getAllowedGroups: () => string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.jwtPayload;
    let authorizationError: HttpError | undefined;

    if (!isValidRestaurantJwtPayload(payload)) {
      authorizationError = new HttpError(401, "Authentication required");
    } else if (
      !getAllowedGroups().some((group) =>
        payload["cognito:groups"].includes(group),
      )
    ) {
      authorizationError = new HttpError(403, "Insufficient permissions");
    }

    next(authorizationError);
  };

export const requireRestaurantManager = requireAnyGroup(() => [
  getGroup("RESTAURANT_OWNER_GROUP", "restaurant-owner"),
]);

export const getAuthenticatedSubject = (req: Request): string => {
  const payload = req.jwtPayload;

  if (!isValidRestaurantJwtPayload(payload)) {
    throw new HttpError(401, "Authentication required");
  }

  return payload.sub;
};

const isValidRestaurantJwtPayload = (
  payload: RestaurantJwtPayload | undefined,
): payload is RestaurantJwtPayload =>
  payload !== undefined &&
  typeof payload.sub === "string" &&
  payload.sub.length > 0 &&
  Array.isArray(payload["cognito:groups"]) &&
  payload["cognito:groups"].every(
    (group): group is string => typeof group === "string",
  );
