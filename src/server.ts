import app from "@src/app";
import ENV from "./common/constants/ENV";
import logger from "jet-logger";
/**
 * server.ts의 역할은 app.ts에서 만든 Express 앱을 실제로 실행하는 여 ㄱ할
 *
 * 비즈니스 로직이나 라우팅, 미들웨어 이런것들을 일체 하지 않음
 *
 *
 */

/**
 * 실제 서버가 네트워크 포트를 열고 요청을 받을 수 있게.
 * listen()이 실행된 후는 POSTMAN이나 프론트엔드에서 API 호출가능
 */

app.listen(ENV.Port, () => {
  logger.info(`Server is running on port ${ENV.Port}`);
});

/**
 * 주의점 강조 server.ts는 오직 서버 열기만 한다.
 * 라우터나 추가적인 미들웨어는 app.ts가서 ㄱㄱ
 *
 *
 */
