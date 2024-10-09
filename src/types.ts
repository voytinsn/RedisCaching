import { z } from "zod";
import { itemFlatZod, upcomingItemZod } from "./itemZod";

/**
 * Товар, содержит данные о tradable и non_tradable вариантах
 */
export interface Item {
  market_hash_name: string;
  currency: string;
  item_page: string;
  market_page: string;
  tradable: ItemDynamicFields;
  non_tradable: ItemDynamicFields;
}

export type ItemFlat = z.infer<typeof itemFlatZod>;

export interface ItemDynamicFields {
  suggested_price: number | null;
  min_price: number | null;
  max_price: number | null;
  mean_price: number | null;
  quantity: number;
  created_at: number;
  updated_at: number | null;
}

export type UpcomingItem = z.infer<typeof upcomingItemZod>;
