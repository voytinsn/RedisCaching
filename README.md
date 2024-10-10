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
npm i
```

```
npm run build
```

```
npm start
```

Далее можно можно отправлять запросы к эндпоинтам.
Предлагаю использовать VS Code и расширение [Rest client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

Под это расширение в репозитории есть коллекция запросов с JWT тестового пользователя

```
cp .rest.example .rest
```
