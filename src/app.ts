// app.ts
// -----------------------------------------------------------------------------
// - Express 애플리케이션의 핵심 구성 요소(미들웨어/라우팅/에러 핸들러)를 정의
// - 실제 서버 포트 바인딩은 server.ts가 담당하며, app.ts는 HTTP Application 자체에 집중
// -----------------------------------------------------------------------------
import express from "express";
import { Request, Response, NextFunction } from "express";
import path from "path";
import logger from "jet-logger";
import BaseRouter from "./routes";
import Paths from "./common/constants/Paths";
import HttpStatusCodes from "./common/constants/HttpStatusCodes";
import { RouteError } from "./common/util/route-errors";
import { sequelize } from "./db";
import UserModel from "./models/User";
import PostModel from "./models/Post";
import PostImageModel from "./models/PostImage";
import { setupSwagger } from "./config/swagger";
import ENV from "./common/constants/ENV";

const app = express();

/**
 * ---------------------------------------------------------------------------
 * Global Middleware
 * ---------------------------------------------------------------------------
 * - express.json : JSON Body 파싱
 * - express.urlencoded : form-urlencoded 파싱 (프론트 HTML 폼 대응)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static Files (CSS, JS, Images)
 * public/ 폴더의 정적 파일들을 서빙
 * __dirname이 src/를 가리키므로 ../public 대신 public 사용
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * Views Directory
 * views/ 폴더 경로 설정
 * __dirname이 src/를 가리키므로 ../views 대신 views 사용
 */
const viewsDir = path.join(__dirname, "views");

/**
 * ---------------------------------------------------------------------------
 * HTML Pages Routes
 * ---------------------------------------------------------------------------
 * - `/users`, `/posts`, `/` 요청 시 정적 HTML 페이지 제공
 * - React/Vue 없이 Handlebars+Vanilla JS로 구성된 뷰를 노출한다.
 */
app.get("/users", (_: Request, res: Response) => {
  return res.sendFile("users.html", { root: viewsDir });
});

app.get("/posts", (_: Request, res: Response) => {
  return res.sendFile("posts.html", { root: viewsDir });
});

app.get("/", (_: Request, res: Response) => {
  return res.sendFile("index.html", { root: viewsDir });
});

/**
 * ---------------------------------------------------------------------------
 * Database Sync Helper
 * ---------------------------------------------------------------------------
 * server.ts에서 import하여 매번 서버 시작 시 스키마를 초기화한다.
 * (과제 요구사항: 항상 동일한 초기 상태 보장)
 */
export async function syncDatabase() {
  if (!ENV.DbForceSync) {
    logger.info(
      "DB_FORCE_SYNC=false → 기존 데이터를 유지한 채로 서버를 시작합니다."
    );
    return;
  }
  try {
    await sequelize.sync({ force: true });
    logger.info("✓ 데이터베이스 테이블이 초기화되었습니다 (force: true)");
  } catch (error) {
    logger.err("✗ 데이터베이스 동기화 실패");
    logger.err(error, true);
    throw error;
  }
}

/**
 * ---------------------------------------------------------------------------
 * Swagger API Documentation
 * ---------------------------------------------------------------------------
 * /api-docs 에서 Swagger UI 확인 가능
 */
setupSwagger(app);

/**
 * ---------------------------------------------------------------------------
 * API Router Mount
 * ---------------------------------------------------------------------------
 * Paths.Base === "/api"
 * => 모든 API 요청은 BaseRouter(routes/index.ts)로 위임
 */
app.use(Paths.Base, BaseRouter);

/**
 * ---------------------------------------------------------------------------
 * Global Error Handler
 * ---------------------------------------------------------------------------
 * - Service/Repo에서 던지는 RouteError를 일관된 JSON 응답으로 변환
 * - 예기치 못한 에러는 500으로 감싼 뒤 로그를 남긴다.
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
