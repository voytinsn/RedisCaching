import { postgresService } from "../services/postgresService";
import { Purchase } from "../types";

const tableName = "purchases";

/**
 * Создает в БД запись о покупке
 */
async function insert(purchase: Purchase): Promise<number> {
  console.log(
    `Добавление в БД информации о покупке, user_id ${purchase.user_id}, item_id ${purchase.item_id}`
  );

  const query: string = `
      INSERT INTO "${tableName}" ("user_id", "item_id", "price", "currency")
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

  const rows: { id: number }[] = await postgresService.executeQuery<{
    id: number;
  }>(query, [
    purchase.user_id,
    purchase.item_id,
    purchase.price,
    purchase.currency,
  ]);

  return rows[0].id;
}

export const purchaseModel = {
  insert,
};
