// src/db/index.ts
import { Sequelize } from "sequelize";
import { URL } from "url";
import logger from "jet-logger";
import ENV from "../common/constants/ENV";

/**
 * Sequelize 인스턴스 생성 (MySQL 연결)
 * DATABASE_URL 형식 예:
 *   mysql://user:password@localhost:3306/webhw3
 */
const dbUrl = new URL(ENV.DatabaseUrl);

// 과제 요구사항: DB 이름(webhw3) 통일
const REQUIRED_DB_NAME = "webhw3";
if (dbUrl.pathname.replace("/", "") !== REQUIRED_DB_NAME) {
  dbUrl.pathname = `/${REQUIRED_DB_NAME}`;
}

export const sequelize = new Sequelize(dbUrl.toString(), {
  dialect: "mysql",
  logging: false,
});

/**
 * DB 연결 테스트 함수
 * 서버 시작 시 불러서 정상 연결 여부 확인 가능
 */
export async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info("✓ DB 연결 성공");
  } catch (err) {
    logger.err("✗ DB 연결 실패");
    logger.err(err as Error, true);
    throw err;
  }
}

export default sequelize;