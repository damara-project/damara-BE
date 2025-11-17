import express from "express";
import { Request, Response, NextFunction } from "express";
import logger from "jet-logger";
import BaseRouter from "./routes";
import Paths from "./common/constants/Paths";
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

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  void _next;

  // 어디서 어떤 에러가 발생했는지 로그를 남긴다.
  // 운영 환경에서는 winston/jet-logger 같은 정식 로거를 사용하는 것이 바람직하다.
  logger.err(`[Unhandled Error] ${req.method} ${req.path}`);
  logger.err(err, true);

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
