// src/db/index.ts
import { Sequelize } from "sequelize";
import logger from "jet-logger";
import ENV from "../common/constants/ENV";

/**
 * Sequelize 인스턴스 생성 (MySQL 연결)
 * 이제 DATABASE_URL이 아닌 개별 환경변수 기반으로 연결
 */
export const sequelize = new Sequelize(
  ENV.DbName, // database
  ENV.DbUser, // username
  ENV.DbPassword, // password
  {
    host: ENV.DbHost,
    dialect: "mysql",
    logging: false,
  }
);

/**
 * DB 연결 테스트 함수
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
