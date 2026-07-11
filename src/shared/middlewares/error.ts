import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { HttpError } from "../http";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode =
    error instanceof ZodError
      ? 400
      : error instanceof HttpError
        ? error.statusCode
        : 500;

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "request_error",
      method: req.method,
      path: req.originalUrl,
      statusCode,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { message: String(error) },
    }),
  );

  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ message: "Validation failed", issues: error.issues });
  } else if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
};
