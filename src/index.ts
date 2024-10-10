import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import { redisService } from "./services/redisService";
import { toCents, updateCache } from "./helper";
import { catalogService } from "./services/catalogService";
import { itemModel } from "./models/itemModel";
import { postgresService } from "./services/postgresService";
import { requireAuth } from "./middlewares/requireAuth";
import { errorHandler } from "./middlewares/errorHandler";
import { buyItemPostZod } from "./zodSchemas";
import { userModel } from "./models/userModel";
import { HttpStatusCode } from "axios";
import { purchaseModel } from "./models/purchaseModel";
import { Purchase } from "./types";

dotenv.config();
const expressPort = process.env.PORT;

async function main() {
  console.log("Подключение к Postgres");
  await postgresService.connectToDb();

  console.log("Подключение к Redis");
  await redisService.client.connect();

  //   console.log("Очистка хранилища Redis перед началом работы");
  //   await redisService.client.flushDb();

  //   console.log("Кэширование данные о товарах");
  //   const items = await catalogService.getItemsWithPrices();
  //   await redisService.setItems(items);

  //   console.log("Создание или обновление записей о товарах в БД");
  //   await itemModel.upsertMany(items);

  //   // Кэш обновляется каждые 5 минут
  //   setInterval(() => {
  //     try {
  //       updateCache;
  //     } catch (e) {
  //       if (e instanceof Error)
  //         console.log("Ошибка при обновлении кэша", e.message);
  //     }
  //   }, 1000 * 60 * 1);

  const app = express();
  app.use(express.json());

  app.get("/items", async (_req, res, next) => {
    try {
      const items = await redisService.getItems();
      res.json(items);
    } catch (e) {
      next(e);
    }
  });

  app.post("/items/buy", requireAuth, async (req, res, next) => {
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
      const centPrice = toCents(cacheItem.tradable.suggested_price)

      // Проверка баланса
      if (user.balance < centPrice) {
        res.status(HttpStatusCode.NotAcceptable);
        res.json({
          success: false,
          message: "Insufficient funds in the account",
        });
        return next();
      }

      // Покупка
      const purchase: Purchase = {
        user_id: user.id,
        item_id: item.id,
        price: centPrice,
        currency: cacheItem.currency,
      };
      await purchaseModel.insert(purchase);

      // Уменьшение баланса
      userModel.reduceBalance(user.id, centPrice);

      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
    // декодировать jwt
    // отбрыкнуть если json отсуствует
    // найти пользователя
    // найти товар
    // отбрыкнуть если что-то не нашлось
    // создать запись о продаже
    // уменьшить баланс
    // не забыть про копейки
    // сделать транзакцию
  });

  app.use(errorHandler);

  app.listen(expressPort, () => {
    return console.log(`Express is listening port ${expressPort}`);
  });
}

main();
