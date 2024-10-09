import { catalogService } from "./services/catalogService";
import { redisService } from "./services/redisService";
import { Item, ItemFlat, UpcomingItem } from "./types";

/**
 * Сливает массивы tradable и nonTradable товаров
 */
export function unionTradableNonTradable(
  tradable: UpcomingItem[],
  nonTradable: UpcomingItem[]
): Item[] {
  console.log("Слияние массивов tradable и nonTradable");

  const tradableMap = new Map<string, UpcomingItem>();

  tradable.forEach((element) => {
    tradableMap.set(element.market_hash_name, element);
  });

  const result: Item[] = nonTradable.map((nonTrItem) => {
    const trItem = tradableMap.get(nonTrItem.market_hash_name);

    if (!trItem) {
      throw new Error("Не удалось сопоставить массивы tradable и nonTradable");
    }

    return {
      market_hash_name: trItem.market_hash_name,
      currency: trItem.currency,
      item_page: trItem.item_page,
      market_page: trItem.market_page,
      tradable: {
        suggested_price: trItem.suggested_price,
        min_price: trItem.min_price,
        max_price: trItem.max_price,
        mean_price: trItem.mean_price,
        quantity: trItem.quantity,
        created_at: trItem.created_at,
        updated_at: trItem.updated_at,
      },
      non_tradable: {
        suggested_price: nonTrItem.suggested_price,
        min_price: nonTrItem.min_price,
        max_price: nonTrItem.max_price,
        mean_price: nonTrItem.mean_price,
        quantity: nonTrItem.quantity,
        created_at: nonTrItem.created_at,
        updated_at: nonTrItem.updated_at,
      },
    };
  });

  return result;
}

/**
 * Преобразует объект Item в Map не содержащую null значений.
 * Такой формат подходит для хранения в Redis.
 */
export function itemToFlatMap(item: Item): Map<string, string | number> {
  const resultMap = new Map<string, string | number>();

  resultMap.set("market_hash_name", item.market_hash_name);
  resultMap.set("currency", item.currency);
  resultMap.set("item_page", item.item_page);
  resultMap.set("market_page", item.market_page);

  if (item.tradable.suggested_price)
    resultMap.set("tradable_suggested_price", item.tradable.suggested_price);

  if (item.tradable.min_price)
    resultMap.set("tradable_min_price", item.tradable.min_price);

  if (item.tradable.max_price)
    resultMap.set("tradable_max_price", item.tradable.max_price);

  if (item.tradable.mean_price)
    resultMap.set("tradable_mean_price", item.tradable.mean_price);

  resultMap.set("tradable_quantity", item.tradable.quantity);
  resultMap.set("tradable_created_at", item.tradable.created_at);

  if (item.tradable.updated_at)
    resultMap.set("tradable_updated_at", item.tradable.updated_at);

  if (item.non_tradable.suggested_price)
    resultMap.set(
      "non_tradable_suggested_price",
      item.non_tradable.suggested_price
    );

  if (item.non_tradable.min_price)
    resultMap.set("non_tradable_min_price", item.non_tradable.min_price);

  if (item.non_tradable.max_price)
    resultMap.set("non_tradable_max_price", item.non_tradable.max_price);

  if (item.non_tradable.mean_price)
    resultMap.set("non_tradable_mean_price", item.non_tradable.mean_price);

  resultMap.set("non_tradable_quantity", item.non_tradable.quantity);
  resultMap.set("non_tradable_created_at", item.non_tradable.created_at);

  if (item.non_tradable.updated_at)
    resultMap.set("non_tradable_updated_at", item.non_tradable.updated_at);

  return resultMap;
}

/**
 * Преобразует объект ItemFlat в формат с вложенными объектами
 * tradable и non_tradable
 */
export function flatItemToItem(itemFlat: ItemFlat): Item {
  return {
    market_hash_name: itemFlat.market_hash_name,
    currency: itemFlat.currency,
    item_page: itemFlat.item_page,
    market_page: itemFlat.market_page,
    tradable: {
      suggested_price: itemFlat?.tradable_suggested_price || null,
      min_price: itemFlat?.tradable_min_price || null,
      max_price: itemFlat?.tradable_max_price || null,
      mean_price: itemFlat?.tradable_mean_price || null,
      quantity: itemFlat.tradable_quantity,
      created_at: itemFlat.tradable_created_at,
      updated_at: itemFlat?.tradable_updated_at || null,
    },
    non_tradable: {
      suggested_price: itemFlat?.non_tradable_suggested_price || null,
      min_price: itemFlat?.non_tradable_min_price || null,
      max_price: itemFlat?.non_tradable_max_price || null,
      mean_price: itemFlat?.non_tradable_mean_price || null,
      quantity: itemFlat.non_tradable_quantity,
      created_at: itemFlat.non_tradable_created_at,
      updated_at: itemFlat?.non_tradable_updated_at || null,
    },
  };
}

/**
 * Получает данные о товарах из каталога и сохраняет их в Redis
 */
export async function updateCache(): Promise<void> {
  console.log("Обновление кэша");
  const tradable = await catalogService.getItems(true);
  const nonTradable = await catalogService.getItems(false);
  const items = unionTradableNonTradable(tradable, nonTradable);
  await redisService.setItems(items);
}
