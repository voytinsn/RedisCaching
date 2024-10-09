import axios from "axios";
import { UpcomingItem } from "../types";
import { z } from "zod";
import { upcomingItemZod } from "../itemZod";

console.log('process.env.UPCOMING_API_URL', process.env.UPCOMING_API_URL)

const axiosClient = axios.create({
  baseURL: process.env.UPCOMING_API_URL,
});

const itemsEndpoint = "/v1/items";

/**
 * Получает список товаров из каталога
 *
 * @param tradable
 * @returns
 */
async function getItems(
  tradable: boolean = false
): Promise<UpcomingItem[]> {
  console.log("Получение товаров. tradable =", tradable);
  const response = await axiosClient.get(itemsEndpoint, {
    params: { tradable },
  });

  console.log("Валидация и типизация через zod");
  const items = z.array(upcomingItemZod).parse(response.data);
  console.log("Получено записей:", items.length)
  return items;
}

export const catalogService = {
  getItems
}
