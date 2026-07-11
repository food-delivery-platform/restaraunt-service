import cors from "cors";

const getCorsOrigins = () =>
  process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const corsMiddleware = () => {
  const corsOrigins = getCorsOrigins();

  return cors({
    origin: corsOrigins?.length ? corsOrigins : true,
  });
};
