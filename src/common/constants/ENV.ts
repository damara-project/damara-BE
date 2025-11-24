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
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
});

const ENV = {
  NodeEnv: parsed.NODE_ENV,
  Port: parsed.PORT,
  DatabaseUrl: parsed.DATABASE_URL,
  ApiBaseUrl: parsed.API_BASE_URL || `http://localhost:${parsed.PORT}`,
};

/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;

export type AppEnv = typeof ENV;
