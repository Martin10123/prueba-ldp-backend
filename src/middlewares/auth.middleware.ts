import type { NextFunction, Request, Response } from "express";
import { sendError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { verifyAuthToken } from "../lib/jwt";

function getTokenFromHeader(header?: string) {
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return sendError(res, 401, "UNAUTHORIZED", "Token de autenticación no proporcionado");
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 401, "UNAUTHORIZED", "El usuario correspondiente al token no existe");
    }

    req.user = user;
    return next();
  } catch {
    return sendError(res, 401, "UNAUTHORIZED", "Token inválido o expirado");
  }
}