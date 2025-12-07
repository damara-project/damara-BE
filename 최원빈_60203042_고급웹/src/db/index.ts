// src/db/index.ts
import { Sequelize } from "sequelize";
import logger from "jet-logger";
import ENV from "../common/constants/ENV";

export const sequelize = new Sequelize(ENV.DbName, ENV.DbUser, ENV.DbPassword, {
  host: ENV.DbHost,
  port: ENV.DbPort,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    connectTimeout: 60000, // EC2에서는 socketPath 절대 사용 금지
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});

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
