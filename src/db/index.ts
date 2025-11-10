import { Pool, PoolClient, QueryConfig, QueryResult } from 'pg';

import ENV from '@src/common/constants/ENV';

const pool = new Pool({
  connectionString: ENV.DatabaseUrl,
});

type QueryText = string | QueryConfig<unknown[]>;

export const query = <T = unknown>(
  text: QueryText,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  if (typeof text === 'string') {
    return pool.query<T>(text, params);
  }

  return pool.query<T>(text);
};

export const getClient = (): Promise<PoolClient> => pool.connect();

export const closePool = (): Promise<void> => pool.end();

export default pool;

