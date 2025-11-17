import express from "express";
import { Request, Response, NextFunction } from "express";
import BaseRouter from "./routes";
import Paths from "tests/common/Paths";
import HttpStatusCodes from "./common/constants/HttpStatusCodes";
import { RouteError } from "./common/util/route-errors";

const app = express();

/**
 * Global Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 *
 * Paths.Base는 /api 이고, BaseRouter는 @src/routes/index.ts 에 있는 라우터이다.
 *    따라서, /api 경로로 들어오면 @src/routes/index.ts 에 있는 라우터로 처리된다.  (BaseRouter)
 
 *
 */
app.use(Paths.Base, BaseRouter);

/**
 * Error Handling (Centralized)
 */

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof RouteError) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  return res
    .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: "INTERNAL_SERVER_ERROR" });
});

export default app;
