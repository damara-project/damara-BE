// app.ts
// -----------------------------------------------------------------------------
// Express 애플리케이션의 핵심 구성 요소 정의
// - CORS 무적 모드 적용
// -----------------------------------------------------------------------------

import express from "express";
import { Request, Response, NextFunction } from "express";
import path from "path";
import morgan from "morgan";
import logger from "jet-logger";
import BaseRouter from "./routes";
import Paths from "./common/constants/Paths";
import HttpStatusCodes from "./common/constants/HttpStatusCodes";
import { RouteError } from "./common/util/route-errors";
import { sequelize } from "./db";
import { setupSwagger } from "./config/swagger";
import ENV from "./common/constants/ENV";

// 모든 모델을 import하여 Sequelize가 테이블을 인식하도록 함
import "./models/User";
import "./models/Post";
import "./models/PostImage";
import "./models/ChatRoom";
import "./models/Message";
import "./models/PostParticipant";

const app = express();

/**
 * ---------------------------------------------------------------------------
 * 🔥 완전 무적 CORS 설정 (모든 브라우저 허용)
 * ---------------------------------------------------------------------------
 * - origin: 요청 보낸 origin을 그대로 허용
 * - credentials: true 허용
 * - 모든 메서드/헤더 허용
 * - OPTIONS 프리플라이트 요청 직접 처리
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // Preflight (OPTIONS) 요청은 여기서 바로 종료
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/**
 * ---------------------------------------------------------------------------
 * HTTP Request Logger (morgan)
 * ---------------------------------------------------------------------------
 */
app.use(morgan("combined")); // Apache combined log format

/**
 * ---------------------------------------------------------------------------
 * Request Debugging Middleware (모든 요청 로깅)
 * ---------------------------------------------------------------------------
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[요청 수신] ${req.method} ${req.path}`);
  logger.info(`[요청 파라미터] ${JSON.stringify(req.params)}`);
  logger.info(`[요청 쿼리] ${JSON.stringify(req.query)}`);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`[요청 바디] ${JSON.stringify(req.body)}`);
  }
  next();
});

/**
 * ---------------------------------------------------------------------------
 * Body parser
 * ---------------------------------------------------------------------------
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ---------------------------------------------------------------------------
 * Static Files
 * ---------------------------------------------------------------------------
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * ---------------------------------------------------------------------------
 * Views
 * ---------------------------------------------------------------------------
 */
const viewsDir = path.join(__dirname, "views");

app.get("/users", (_: Request, res: Response) => {
  return res.sendFile("users.html", { root: viewsDir });
});

app.get("/posts", (_: Request, res: Response) => {
  return res.sendFile("posts.html", { root: viewsDir });
});

app.get("/chat", (_: Request, res: Response) => {
  return res.sendFile("chat.html", { root: viewsDir });
});

app.get("/", (_: Request, res: Response) => {
  return res.sendFile("index.html", { root: viewsDir });
});

/**
 * ---------------------------------------------------------------------------
 * Database Sync Helper
 * ---------------------------------------------------------------------------
 */
export async function syncDatabase() {
  if (!ENV.DbForceSync) {
    logger.info("DB_FORCE_SYNC=false → 기존 데이터 유지");
    // force sync가 false여도 누락된 테이블은 생성하도록 alter 옵션 사용
    try {
      await sequelize.sync({ alter: true });
      logger.info("✓ 데이터베이스 테이블 동기화 완료 (alter 모드)");
    } catch (error) {
      logger.warn("데이터베이스 테이블 동기화 중 경고 발생 (무시 가능)");
      logger.warn(error, true);
    }
    return;
  }
  try {
    await sequelize.sync({ force: true });
    logger.info("✓ 데이터베이스 force sync 완료");
  } catch (error) {
    logger.err("✗ 데이터베이스 동기화 실패");
    logger.err(error, true);
    throw error;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Swagger Docs
 * ---------------------------------------------------------------------------
 */
setupSwagger(app);

/**
 * ---------------------------------------------------------------------------
 * API Router
 * ---------------------------------------------------------------------------
 */
app.use(Paths.Base, BaseRouter);

// 디버깅: 등록된 라우트 확인 (모든 환경에서)
logger.info("=== 등록된 라우트 확인 ===");
// Express의 라우트 스택을 확인하기 위해 서버 시작 후 로깅
process.nextTick(() => {
  const routes: string[] = [];
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(
        `${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${
          middleware.route.path
        }`
      );
    } else if (middleware.name === "router") {
      middleware.handle?.stack?.forEach((handler: any) => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)
            .join(", ")
            .toUpperCase();
          const path = handler.route.path;
          routes.push(`${method} ${path}`);
        }
      });
    }
  });
  logger.info(`등록된 라우트 수: ${routes.length}`);
  // PATCH /:id/status 라우트가 있는지 확인
  const statusRoute = routes.find(
    (r) => r.includes("PATCH") && r.includes("status")
  );
  if (statusRoute) {
    logger.info(`✓ 상태 변경 라우트 발견: ${statusRoute}`);
  } else {
    logger.err("✗ PATCH /:id/status 라우트를 찾을 수 없습니다!");
  }
  routes.forEach((route) => logger.info(`  - ${route}`));
});

/**
 * ---------------------------------------------------------------------------
 * Global Error Handler
 * ---------------------------------------------------------------------------
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
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
