import axios from "axios";
import { UpcomingItem } from "../types";
import { z } from "zod";
import { upcomingItemZod } from "../zodSchemas";

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
export async function getItems(
  tradable: boolean = false
): Promise<UpcomingItem[]> {
  const response = await axiosClient.get(itemsEndpoint, {
    params: { tradable },
  });

  const items = z.array(upcomingItemZod).parse(response.data);
  return items;
}
