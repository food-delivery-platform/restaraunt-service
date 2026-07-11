import "dotenv/config";

import knex, { type Knex } from "knex";

import { getDatabaseConnection } from "./database-connection";

export const db: Knex = knex({
  client: "pg",
  connection: getDatabaseConnection,
  pool: {
    min: Number(process.env.DB_POOL_MIN ?? 0),
    max: Number(process.env.DB_POOL_MAX ?? 10),
  },
});
