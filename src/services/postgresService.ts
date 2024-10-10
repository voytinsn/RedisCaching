import { Client, Configuration, connect, ResultRecord } from "ts-postgres";

const configuration: Configuration = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!),
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
  values?: any[]
): Promise<T[]> {
  const result = await client.query<T>(query, values);
  let rows: Array<T> = [];

  for (const obj of result) {
    rows.push(obj);
  }

  return rows;
}

/**
 * Выполняет запрос без возвращения результата
 */
async function executeNonQuery(query: string, values?: any[]): Promise<void> {
  await client.query(query, values);
}

export const postgresService = {
  connectToDb,
  executeQuery,
  executeNonQuery,
};