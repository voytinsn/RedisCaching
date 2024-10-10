import { postgresService } from "../services/postgresService";
import type { User } from "../types";

const tableName = "users";

/**
 * Находит сотрудника по логину
 */
async function getByLogin(login: string): Promise<User | null> {
  console.log(`Поиск в БД пользователя ${login}`);

  const query = `
    select *
    from ${tableName}
    where login = $1
  `;

  const rows: User[] = await postgresService.executeQuery<User>(query, [login]);

  if (rows.length === 1) {
    console.log(`Пользователь найден, id ${rows[0].id}`);
    return rows[0];
  } else {
    console.log(`Пользователь не найден ${login}`);
    return null;
  }
}

async function getById(id: number): Promise<User | null> {
  console.log(`Поиск в БД пользователя c id ${id}`);

  const query = `
    select *
    from ${tableName}
    where id = $1
  `;

  const rows: User[] = await postgresService.executeQuery<User>(query, [id]);

  if (rows.length === 1) {
    console.log(`Пользователь найден, логин ${rows[0].login}`);
    return rows[0];
  } else {
    console.log(`Пользователь с id ${id} не найден`);
    return null;
  }
}

/**
 * Уменьшает баланс пользователя
 *
 * @returns id записи
 */
async function reduceBalance(id: number, amount: number): Promise<User> {
  console.log(`Уменьшение баланса пользователя с id ${id} на ${amount} центов`);

  const query = `
        UPDATE ${tableName}
        SET balance = balance - $1
        WHERE id = ${id};
      `;

  await postgresService.executeNonQuery(query, [amount]);

  const user = await getById(id);

  if (!user) {
    throw new Error(`В бд нет пользователя с id ${id}`);
  }

  return user;
}

export const userModel = {
  getByLogin,
  reduceBalance,
  getById,
};
