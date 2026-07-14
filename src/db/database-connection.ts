import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import type { Knex } from "knex";
import { z } from "zod";

const databaseSecretSchema = z.object({
  RESTAURANT_DB_URL: z.string().min(1),
});

let cachedConnection: Promise<Knex.PgConnectionConfig> | undefined;

export const getDatabaseConnection = (): Promise<Knex.PgConnectionConfig> => {
  cachedConnection ??= loadDatabaseConnection();
  return cachedConnection;
};

const loadDatabaseConnection = async (): Promise<Knex.PgConnectionConfig> => {
  const secretArn = process.env.AWS_DB_SECRET_ARN;
  if (secretArn === undefined || secretArn.length === 0) {
    throw new Error("AWS_DB_SECRET_ARN environment variable is required");
  }

  const client = new SecretsManagerClient({
    ...(process.env.AWS_REGION !== undefined
      ? { region: process.env.AWS_REGION }
      : {}),
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretArn }),
    );
    const secretValue =
      response.SecretString ??
      (response.SecretBinary !== undefined
        ? Buffer.from(response.SecretBinary).toString("utf8")
        : undefined);

    if (secretValue === undefined) {
      throw new Error("Database secret has no SecretString or SecretBinary");
    }

    const secret = databaseSecretSchema.parse(JSON.parse(secretValue));

    return {
      connectionString: secret.RESTAURANT_DB_URL,
      ssl: getSslConfig(),
    };
  } finally {
    client.destroy();
  }
};

const getSslConfig = (): false | { rejectUnauthorized: boolean } =>
  process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false };
