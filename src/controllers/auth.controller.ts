import type { Request, Response } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../lib/http";
import { logger } from "../lib/logger";
import { loginUser, registerUser } from "../services/auth.service";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const response = await registerUser(data);

    return sendSuccess(res, 201, response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Payload inválido", error.issues);
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return sendError(res, 409, "EMAIL_ALREADY_EXISTS", "El correo electrónico ya está registrado");
    }

    logger.error("Unexpected error in register", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const response = await loginUser(data);

    return sendSuccess(res, 200, response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Payload inválido", error.issues);
    }

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return sendError(res, 401, "INVALID_CREDENTIALS", "Correo electrónico o contraseña inválidos");
    }

    logger.error("Unexpected error in login", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function me(req: Request, res: Response) {
  return sendSuccess(res, 200, req.user);
}