import app, { syncDatabase } from "@src/app";
import ENV from "./common/constants/ENV";
import logger from "jet-logger";
import { connectDB } from "./db";

/**
 * server.ts의 역할은 app.ts에서 만든 Express 앱을 실제로 실행하는 여 ㄱ할
 *
 * 비즈니스 로직이나 라우팅, 미들웨어 이런것들을 일체 하지 않음
 *
 *
 */

/**
 * 서버 시작 전 DB 초기화 및 연결
 */
async function startServer() {
  try {
    // 1. DB 연결 테스트
    await connectDB();

    // 2. DB Sync (force: true로 모든 테이블 삭제 후 재생성)
    // ⚠️ 주의: 서버 실행 시마다 모든 데이터가 삭제됩니다!
    // 과제 평가 시마다 DB를 초기화한 상태에서 시작하기 위함
    await syncDatabase();

    // 3. Express 서버 시작
    app.listen(ENV.Port, () => {
      logger.info(`Server is running on port ${ENV.Port}`);
    });
  } catch (error) {
    logger.err("Failed to start server");
    logger.err(error, true);
    process.exit(1);
  }
}

startServer();

/**
 * 주의점 강조 server.ts는 오직 서버 열기만 한다.
 * 라우터나 추가적인 미들웨어는 app.ts가서 ㄱㄱ
 *
 * 서버 구성 책임인 app.ts와
 * 서버 구동 책임인 server.ts의 역할을 명확히 분리한다.
 *
 * 환경에 따라 다른 server 파일을 활용할 수 있는점을 고려한다.
 */
