import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { redisService } from "./services/redisService";
import { updateCache } from "./helper";
import { catalogService } from "./services/catalogService";
import { itemModel } from "./models/itemModel";
import { postgresService } from "./services/postgresService";
import { errorHandler } from "./middlewares/errorHandler";
import { itemsRouter } from "./routers/itemsRouter";

dotenv.config();
const expressPort = process.env.PORT;

async function main() {
  console.log("Подключение к Postgres");
  await postgresService.connectToDb();

  console.log("Подключение к Redis");
  await redisService.client.connect();

  console.log("Очистка хранилища Redis перед началом работы");
  await redisService.client.flushDb();

  console.log("Кэширование данные о товарах");
  const items = await catalogService.getItemsWithPrices();
  await redisService.setItems(items);

  console.log("Создание или обновление записей о товарах в БД");
  await itemModel.upsertMany(items);

  // Кэш обновляется каждые 5 минут
  setInterval(
    () => {
      try {
        updateCache();
      } catch (e) {
        if (e instanceof Error)
          console.log("Ошибка при обновлении кэша", e.message);
      }
    },
    1000 * 60 * 5,
  );

  const app = express();
  app.use(express.json());
  app.use("/items", itemsRouter);
  app.use(errorHandler);

  app.listen(expressPort, () => {
    return console.log(`Express is listening port ${expressPort}`);
  });
}

main();
