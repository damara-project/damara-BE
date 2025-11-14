import {
  Pool,
  PoolClient,
  QueryConfig,
  QueryResult,
  QueryResultRow,
  DatabaseError,
} from "pg";

import ENV from "@src/common/constants/ENV";

const pool = new Pool({
  connectionString: ENV.DatabaseUrl,
});

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>>;
export function query<T extends QueryResultRow = QueryResultRow>(
  config: QueryConfig
): Promise<QueryResult<T>>;
export function query<T extends QueryResultRow = QueryResultRow>(
  textOrConfig: string | QueryConfig,
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (typeof textOrConfig === "string") {
    return pool.query<T>(textOrConfig, params);
  }

  return pool.query<T>(textOrConfig);
}

export const getClient = (): Promise<PoolClient> => pool.connect();

export const closePool = (): Promise<void> => pool.end();

/**
 * PostgreSQL 에러인지 체크하는 타입 가드
 */
export function isPostgresError(
  error: unknown
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * PostgreSQL unique constraint violation (23505) 에러인지 체크
 */
export function isUniqueConstraintViolation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23505";
}

export { DatabaseError };

export default pool;
