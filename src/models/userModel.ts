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

/**
 * Уменьшает баланс пользователя
 *
 * @returns id записи
 */
async function reduceBalance(id: number, amount: number): Promise<void> {
  console.log(`Уменьшение баланса пользователя с id ${id} на ${amount}`);

  const query = `
        UPDATE ${tableName}
        SET balance = balance - $1
        WHERE id = ${id};
      `;

  await postgresService.executeNonQuery(query, [amount]);
}

export const userModel = {
  getByLogin,
  reduceBalance,
};
