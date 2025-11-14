import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow } from "pg";

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

export default pool;
