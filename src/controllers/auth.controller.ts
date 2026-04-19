import type { Request, Response } from "express";
import { z } from "zod";
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

    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Payload inválido",
        issues: error.issues,
      });
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        error: "EMAIL_ALREADY_EXISTS",
        message: "El correo electrónico ya está registrado",
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const response = await loginUser(data);

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Payload inválido",
        issues: error.issues,
      });
    }

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Correo electrónico o contraseña inválidos",
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function me(req: Request, res: Response) {
  return res.status(200).json({ user: req.user });
}