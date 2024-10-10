## Описание

Приложение раз в 5 минут кэширует каталог товаров с https://docs.skinport.com/#items

Кэш храниться в Redis.
Так же каталог без цен сохраняется в Postgres.

### Эндпоинты

1. GET **/items**
   Отдает список товаров из кэша;
2. POST **/items/buy**
   Покупка товара пользователем. В заголовка ожидается JWT.

## Запуск примера

Потребуется node, docker и docker compose.

```
git clone https://github.com/voytinsn/RedisCaching
```

```
cd RedisCaching
```

```
cp .env.example .env
```

```
cp .rest.example .rest
```

```
npm i
```

```
npm run build
```

```
docker compose up -d
```

```
npm start
```

Далее можно можно отправлять запросы к эндпоинтам.
Предлагаю использовать VS Code и расширение [Rest client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

Под это расширение в репозитории есть коллекция запросов с JWT тестового пользователя.

По умолчанию express.js будет случать порт 3001.

Для просмотра содержимого Redis в docker compose есть redisinsight, доступен по адресу http://127.0.0.1:5540

Для просмотра содержимого Postgres в docker compose есть adminer, доступен по адресу http://127.0.0.1:8084

Данные для подключения к Postgres по умолчанию (поменять можно в .env):

- Движок: PostgreSQL
- Сервер: db
- Имя пользователя: admin
- Пароль: admin
