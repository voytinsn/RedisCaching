import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { redisService } from "./services/redisService";
import { updateCache } from "./helper";

dotenv.config();
const expressPort = process.env.PORT;

async function main() {
  console.log("Подключение к Redis");
  await redisService.client.connect();

  console.log("Очистка хранилища Redis перед началом работы");
  await redisService.client.flushDb();

  // Кэширование данные о товарах
  await updateCache();

  // Кэш обновляется каждые 5 минут
  setInterval(() => {
    try {
      updateCache;
    } catch (e) {
      if (e instanceof Error)
        console.log("Ошибка при обновлении кэша", e.message);
    }
  }, 1000 * 60 * 1);

  const app = express();

  app.get("/items", async (_req, res) => {
    const items = await redisService.getItems();
    res.json(items);
  });

  app.listen(expressPort, () => {
    return console.log(`Express is listening port ${expressPort}`);
  });
}

main();
