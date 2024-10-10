import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";

/**
 * Обрабатывает ошибки
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (res.statusCode === 200) res.status(HttpStatusCode.InternalServerError);

  if (err instanceof Error) {
    res.json({ error: err.message });
  } else {
    res.json({ error: "Error on server" });
  }
}
