import type { Request, Response, NextFunction } from "express";
import jsonwebtoken, { JsonWebTokenError } from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { jwtPayloadZod } from "../zodSchemas";
import { z } from "zod";

/**
 * Проверяет авторизацию по JWT
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log("Авторизация");

  const token: string | null = getTokenFromHeader(req);

  if (!token) {
    console.log("Не передан токен");
    res.status(HttpStatusCode.Unauthorized);
    throw new Error("Authorization required");
  }

  try {
    const decodedJwt = jsonwebtoken.verify(
      token,
      z.string().parse(process.env.JWT_SECRET),
    );
    const payload = jwtPayloadZod.parse(decodedJwt);
    req.app.set("login", payload.login);
    next();
  } catch (e: unknown) {
    if (e instanceof JsonWebTokenError) {
      res.status(HttpStatusCode.Unauthorized);
      throw new Error("Invalid token");
    } else {
      throw e;
    }
  }
}

function getTokenFromHeader(req: Request): string | null {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
}
