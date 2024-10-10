import type { Client, Configuration, ResultRecord } from "ts-postgres";
import { connect } from "ts-postgres";
import { z } from "zod";

const configuration: Configuration = {
  host: process.env.POSTGRES_HOST,
  port: z.coerce.number().parse(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};

let client: Client;

async function connectToDb() {
  client = await connect(configuration);
}

/**
 * Выполняет запрос и возвращает массив объектов,
 * соответствующих строкам результата выполнения запроса
 */
async function executeQuery<T = ResultRecord>(
  query: string,
  values?: (string | number)[],
): Promise<T[]> {
  const result = await client.query<T>(query, values);
  const rows: T[] = [];

  for (const obj of result) {
    rows.push(obj);
  }

  return rows;
}

/**
 * Выполняет запрос без возвращения результата
 */
async function executeNonQuery(
  query: string,
  values?: (string | number)[],
): Promise<void> {
  await client.query(query, values);
}

/**
 * Начинает транзакцию
 */
async function beginTransaction(): Promise<void> {
  await client.query("BEGIN");
}

/**
 * Завершает транзакцию
 */
async function commitTransaction(): Promise<void> {
  await client.query("COMMIT");
}

/**
 * Откатывает транзакцию
 */
async function rollbackTransaction() {
  await client.query("ROLLBACK");
}

export const postgresService = {
  connectToDb,
  executeQuery,
  executeNonQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
};
