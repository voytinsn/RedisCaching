import { Router } from "express";
import { postgresService } from "../services/postgresService";
import type { Purchase } from "../types";
import { userModel } from "../models/userModel";
import { purchaseModel } from "../models/purchaseModel";
import { toCents } from "../helper";
import { HttpStatusCode } from "axios";
import { redisService } from "../services/redisService";
import { itemModel } from "../models/itemModel";
import { requireAuth } from "../middlewares/requireAuth";
import { buyItemPostZod } from "../zodSchemas";

export const itemsRouter = Router();

/**
 * Отдает список товаров с двумя ценам
 * tradable и non_tradable
 */
itemsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await redisService.getItems();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

/**
 * Покупка товара пользователем
 */
itemsRouter.post("/buy", requireAuth, async (req, res, next) => {
  try {
    const login = req.app.get("login") as string;
    const body = buyItemPostZod.parse(req.body);

    // Получение данных о пользователе
    const user = await userModel.getByLogin(login);

    if (!user) {
      res.status(HttpStatusCode.Forbidden);
      throw new Error("Unknown user");
    }

    // Получение данных о товаре
    const item = await itemModel.getByName(body.market_hash_name);

    if (!item) {
      res.status(HttpStatusCode.NotFound);
      throw new Error("Item not exist");
    }

    // Получение цены на товар из кэша
    const cacheItem = await redisService.getItemByHash(item.market_hash_name);

    if (!cacheItem) {
      res.status(HttpStatusCode.InternalServerError);
      throw new Error("No price data");
    }

    // Проверка наличия цены на товар
    if (!cacheItem.tradable.suggested_price) {
      res.status(HttpStatusCode.NotAcceptable);
      res.json({ success: false, message: "Item has no price" });
      return next();
    }

    // Перевод цены в центы
    const centPrice = toCents(cacheItem.tradable.suggested_price);

    // Проверка баланса
    if (user.balance < centPrice) {
      res.status(HttpStatusCode.NotAcceptable);
      res.json({
        success: false,
        message: "Insufficient funds in the account",
      });
      return next();
    }

    // Создание записи о покупке и уменьшение баланса
    // выполняются одной транзакцией
    try {
      await postgresService.beginTransaction();

      // Покупка
      const purchase: Purchase = {
        user_id: user.id,
        item_id: item.id,
        price: centPrice,
        currency: cacheItem.currency,
      };
      await purchaseModel.insert(purchase);

      // Уменьшение баланса
      const dbUser = await userModel.reduceBalance(user.id, centPrice);

      await postgresService.commitTransaction();

      res.json({
        success: true,
        balance: dbUser.balance / 100,
      });
    } catch (e) {
      await postgresService.rollbackTransaction();
      throw e;
    }
  } catch (e) {
    next(e);
  }
});
