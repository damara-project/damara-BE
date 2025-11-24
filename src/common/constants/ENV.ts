/* eslint-disable n/no-process-env */

import { NodeEnvs } from ".";
import { z } from "zod";

/******************************************************************************
                                 Setup
******************************************************************************/

const envSchema = z.object({
  NODE_ENV: z
    .enum([NodeEnvs.Dev, NodeEnvs.Test, NodeEnvs.Production])
    .default(NodeEnvs.Dev),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  API_BASE_URL: z.string().url().optional(),
  DB_FORCE_SYNC: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const parsed = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  API_BASE_URL: process.env.API_BASE_URL,
  DB_FORCE_SYNC: process.env.DB_FORCE_SYNC,
});

const ENV = {
  NodeEnv: parsed.NODE_ENV,
  Port: parsed.PORT,

  DbHost: parsed.DB_HOST,
  DbUser: parsed.DB_USER,
  DbPassword: parsed.DB_PASSWORD,
  DbName: parsed.DB_NAME,

  ApiBaseUrl: parsed.API_BASE_URL || `http://localhost:${parsed.PORT}`,
  DbForceSync: parsed.DB_FORCE_SYNC ?? false,
};

/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;

export type AppEnv = typeof ENV;
