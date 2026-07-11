import type { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
    const log = res.statusCode >= 500 ? console.error : console.info;

    log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: res.statusCode >= 500 ? "error" : "info",
        event: "http_request",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      }),
    );
  });

  next();
};
