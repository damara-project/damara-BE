import { ZodSchema } from "zod";
import { RouteError } from "@src/common/util/route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

/**
 * parseReq(schema)(req.body)
 *
 * - schema로 검증하고
 * - 실패하면 ValidationError 라우트 에러 throw
 * - 성공하면 타입 안전한 데이터 반환
 */
export function parseReq<T>(schema: ZodSchema<T>) {
  return (input: unknown): T => {
    const result = schema.safeParse(input);

    if (!result.success) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
    }

    return result.data;
  };
}
