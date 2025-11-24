/* eslint-disable n/no-process-env */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import moduleAlias from "module-alias";

// Check the env
const NODE_ENV = process.env.NODE_ENV ?? "development";

const resolveRoot = () => {
  const dir = __dirname;
  if (dir.endsWith(path.sep + "dist")) {
    return path.resolve(dir, "..");
  }
  return dir;
};

const rootDir = resolveRoot();

const candidateEnvPaths = [
  path.join(rootDir, "config", `.env.${NODE_ENV}`),
  path.join(rootDir, `.env.${NODE_ENV}`),
  path.join(rootDir, ".env"),
];

const isManagedEnv =
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT_NAME) ||
  Boolean(process.env.RAILWAY_PROJECT_ID);

let envLoaded = false;
if (!isManagedEnv) {
  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      envLoaded = true;
      break;
    }
  }

  if (!envLoaded) {
    dotenv.config();
  }
} else {
  console.log(
    "[config] Managed environment detected (e.g. Railway); skipping local .env.* files."
  );
}

// Configure moduleAlias
if (__filename.endsWith("js")) {
  moduleAlias.addAlias("@src", __dirname + "/dist");
}
