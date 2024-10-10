import { z } from "zod";

/**
 * Схема товара в каталоге
 */
export const upcomingItemZod = z.object({
  market_hash_name: z.string().min(1),
  currency: z.string().min(1),
  suggested_price: z.number().nullable(),
  item_page: z.string().min(1),
  market_page: z.string().min(1),
  min_price: z.number().nullable(),
  max_price: z.number().nullable(),
  mean_price: z.number().nullable(),
  quantity: z.number(),
  created_at: z.number(),
  updated_at: z.number().nullable(),
});


/**
 * Схема товара в Redis
 */
export const itemFlatZod = z.object({
  market_hash_name: z.string(),
  currency: z.string(),
  item_page: z.string(),
  market_page: z.string(),
  tradable_suggested_price: z.coerce.number().nullish(),
  tradable_min_price: z.coerce.number().nullish(),
  tradable_max_price: z.coerce.number().nullish(),
  tradable_mean_price: z.coerce.number().nullish(),
  tradable_quantity: z.coerce.number(),
  tradable_created_at: z.coerce.number(),
  tradable_updated_at: z.coerce.number().nullish(),
  non_tradable_suggested_price: z.coerce.number().nullish(),
  non_tradable_min_price: z.coerce.number().nullish(),
  non_tradable_max_price: z.coerce.number().nullish(),
  non_tradable_mean_price: z.coerce.number().nullish(),
  non_tradable_quantity: z.coerce.number(),
  non_tradable_created_at: z.coerce.number(),
  non_tradable_updated_at: z.coerce.number().nullish(),
});

export const jwtPayloadZod = z.object({
  login: z.string().min(1)
})

export const buyItemPostZod = z.object({
  market_hash_name: z.string().min(1)
})