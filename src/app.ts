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

const app = express();

/**
 * Global Middleware
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
 * HTML Pages Routes
 * 프론트엔드 HTML 페이지 서빙
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
 * Database Sync (force: true로 서버 시작 시마다 테이블 재생성)
 * 과제 평가 시마다 DB를 초기화한 상태에서 시작하기 위함
 */
export async function syncDatabase() {
  try {
    // force: true는 기존 테이블을 모두 삭제하고 새로 생성합니다.
    // ⚠️ 주의: 서버 실행 시마다 모든 데이터가 삭제됩니다!
    await sequelize.sync({ force: true });
    logger.info("✓ 데이터베이스 테이블이 초기화되었습니다 (force: true)");
  } catch (error) {
    logger.err("✗ 데이터베이스 동기화 실패");
    logger.err(error, true);
    throw error;
  }
}

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
