import type { NextFunction, Request, Response } from "express";
import { jwtDecode } from "jwt-decode";

import { HttpError } from "../http";
import type { RestaurantJwtPayload } from "../types/restaurant-jwt-payload";

export const jwtParser = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.get("authorization");
  let parsingError: HttpError | undefined;

  if (authorization) {
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);

    if (!match?.[1]) {
      parsingError = new HttpError(400, "Invalid authorization header");
    } else {
      try {
        req.jwtPayload = jwtDecode<RestaurantJwtPayload>(match[1]);
      } catch {
        parsingError = new HttpError(400, "Invalid bearer token");
      }
    }
  }

  next(parsingError);
};
