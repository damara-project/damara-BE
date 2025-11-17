// src/db/index.ts
import { Sequelize } from "sequelize";
import ENV from "@src/common/constants/ENV";

/**
 * Sequelize 인스턴스 생성 (MySQL 연결)
 * DATABASE_URL 형식 예:
 *   mysql://user:password@localhost:3306/damara
 */
export const sequelize = new Sequelize(ENV.DatabaseUrl, {
  dialect: "mysql", //MySQL 사용
  logging: false, // SQL 로그 감추기
});

/**
 * DB 연결 테스트 함수
 * 서버 시작 시 불러서 정상 연결 여부 확인 가능
 */
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✓ DB 연결 성공");
  } catch (err) {
    console.error("✗ DB 연결 실패");
    console.error(err);
    throw err;
  }
}

export default sequelize;
