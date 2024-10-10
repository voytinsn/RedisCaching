import { postgresService } from "../services/postgresService";
import type { DbItem, Item } from "../types";

const tableName = "items";

/**
 * Создает в БД запись о товаре
 */
async function insert(item: Item): Promise<number> {
  console.log(`Добавление в БД товара ${item.market_hash_name}`);

  const query = `
      INSERT INTO "${tableName}" ("market_hash_name", "item_page", "market_page")
      VALUES ($1, $2, $3)
      RETURNING id;
    `;

  const rows: { id: number }[] = await postgresService.executeQuery<{
    id: number;
  }>(query, [item.market_hash_name, item.item_page, item.market_page]);

  return rows[0].id;
}

/**
 * Обновляет запись о товаре
 *
 * @returns id записи
 */
async function update(id: number, item: Item): Promise<void> {
  console.log(`Обновление в БД информации о товаре ${item.market_hash_name}`);

  const query = `
        UPDATE ${tableName}
        SET market_hash_name = $1, item_page = $2, market_page = $3
        WHERE id = ${id};
      `;

  await postgresService.executeNonQuery(query, [
    item.market_hash_name,
    item.item_page,
    item.market_page,
  ]);
}

/**
 * Находит товар по названию
 */
async function getByName(name: string): Promise<DbItem | null> {
  console.log(`Поиск в БД товара ${name}`);

  const query = `
    select *
    from ${tableName}
    where market_hash_name = $1
  `;

  const rows: DbItem[] = await postgresService.executeQuery<DbItem>(query, [
    name,
  ]);

  if (rows.length === 1) {
    console.log(`Товар найден, id ${rows[0].id}`);
    return rows[0];
  } else {
    console.log(`Товар не найден ${name}`);
    return null;
  }
}

/**
 * Обновляет или создает в БД запись о товаре
 *
 * @returns id записи
 */
async function upsert(item: Item): Promise<number> {
  const dbItem = await getByName(item.market_hash_name);

  if (dbItem) {
    await update(dbItem.id, item);
    return dbItem.id;
  } else {
    return await insert(item);
  }
}

/**
 *  * Обновляет или создает в БД записи о множестве товаров
 */
async function upsertMany(items: Item[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      await upsert(item);
    }),
  );
}

export const itemModel = {
  insert,
  update,
  upsert,
  upsertMany,
  getByName,
};
