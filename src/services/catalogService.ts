import axios from "axios";
import type { Item, UpcomingItem } from "../types";
import { z } from "zod";
import { upcomingItemZod } from "../zodSchemas";
import { unionTradableNonTradable } from "../helper";

console.log("process.env.UPCOMING_API_URL", process.env.UPCOMING_API_URL);

const axiosClient = axios.create({
  baseURL: process.env.UPCOMING_API_URL,
});

const itemsEndpoint = "/v1/items";

/**
 * Получает список товаров из каталога
 */
async function getItems(tradable: boolean = false): Promise<UpcomingItem[]> {
  console.log("Получение товаров. tradable =", tradable);
  const response = await axiosClient.get(itemsEndpoint, {
    params: { tradable },
  });

  console.log("Валидация и типизация через zod");
  const items = z.array(upcomingItemZod).parse(response.data);
  console.log("Получено записей:", items.length);
  return items;
}

/**
 * Получает из каталога список товаров
 * с tradable и non_tradable ценами
 */
async function getItemsWithPrices(): Promise<Item[]> {
  const tradable = await catalogService.getItems(true);
  const nonTradable = await catalogService.getItems(false);
  const items = unionTradableNonTradable(tradable, nonTradable);
  return items;
}

export const catalogService = {
  getItems,
  getItemsWithPrices
};
