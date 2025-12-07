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

let envLoaded = false;
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

// Configure moduleAlias
if (__filename.endsWith("js")) {
  moduleAlias.addAlias("@src", __dirname + "/dist");
}
