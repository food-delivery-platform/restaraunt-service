import express from "express";

import { categoryRouter } from "./modules/categories/categories-controller";
import { menuItemRouter } from "./modules/menu-items/menu-items-controller";
import { restaurantRouter } from "./modules/restaurants/restaurants-controller";
import { corsMiddleware } from "./shared/middlewares/cors";
import { errorHandler } from "./shared/middlewares/error";
import { requestLogger } from "./shared/middlewares/request-logger";

export const createApp = () => {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/restaurants", restaurantRouter);
  app.use("/categories", categoryRouter);
  app.use("/menu-items", menuItemRouter);

  app.use(errorHandler);

  return app;
};
