import { createClient } from "redis";
import type { Item, ItemFlat } from "../types";
import { flatItemToItem, itemToFlatMap } from "../helper";
import { itemFlatZod } from "../zodSchemas";
import { z } from "zod";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

/**
 * Записывает в Redis массив товаров
 */
async function setItems(items: Item[]): Promise<void> {
  console.log("Запись данных о товарах в Redis, количество:", items.length);
  // Данные записываются в Redis параллельно
  await Promise.all(
    items.map(async (item) => {
      const itemFlat: Map<string, string | number> = itemToFlatMap(item);
      await client.hSet(`item__${item.market_hash_name}`, itemFlat);
    }),
  );
}

/**
 * Получает из Redis массив товаров
 */
async function getItems(): Promise<Item[]> {
  console.log("Получение данных о товарах из Redis");
  const keys = await client.keys("item__*");
  const values = (await Promise.all(
    keys.map(async (key) => {
      return client.hGetAll(key);
    }),
  )) as unknown[];

  const itemsFlat: ItemFlat[] = z.array(itemFlatZod).parse(values);
  const items = itemsFlat.map((itemFlat) => flatItemToItem(itemFlat));
  console.log("Получено записей:", items.length);
  return items;
}

/**
 * Получает из Redis данные о товаре по его хэшу
 */
async function getItemByHash(hash: string): Promise<Item | null> {
  console.log("Получение данных о товаре из Redis, hash:", hash);
  const data = await client.hGetAll(`item__${hash}`);
  try {
    const itemFlat = itemFlatZod.parse(data);
    const item = flatItemToItem(itemFlat);
    return item;
  } catch {
    console.log("Данные о товаре не найдены в Redis");
    return null;
  }
}

export const redisService = {
  client,
  getItems,
  getItemByHash,
  setItems,
};
