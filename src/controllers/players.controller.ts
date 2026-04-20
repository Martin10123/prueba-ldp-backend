import { Position } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../lib/http";
import { logger } from "../lib/logger";
import { createPlayer, deletePlayer, getPlayerById, listPlayers, updatePlayer } from "../services/players.service";

const listPlayersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  position: z.nativeEnum(Position).optional(),
  nationality: z.string().trim().min(1).optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const createPlayerSchema = z.object({
  name: z.string().trim().min(2),
  birthDate: z.coerce.date(),
  nationality: z.string().trim().min(2),
  position: z.nativeEnum(Position),
  photoUrl: z.string().trim().url().optional(),
  currentTeamId: z.string().trim().min(1).optional(),
});

const updatePlayerSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    birthDate: z.coerce.date().optional(),
    nationality: z.string().trim().min(2).optional(),
    position: z.nativeEnum(Position).optional(),
    photoUrl: z.string().trim().url().optional(),
    currentTeamId: z.union([z.string().trim().min(1), z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

function omitUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

export async function getPlayers(req: Request, res: Response) {
  try {
    const query = listPlayersSchema.parse(req.query);
    const { page, limit, ...filters } = query;

    if (
      typeof filters.minAge === "number" &&
      typeof filters.maxAge === "number" &&
      filters.minAge > filters.maxAge
    ) {
      return sendError(res, 400, "VALIDATION_ERROR", "minAge no puede ser mayor que maxAge");
    }

    const players = await listPlayers({
      filters,
      pagination: { page, limit },
    });
    return sendSuccess(res, 200, players);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Parámetros inválidos", error.issues);
    }

    logger.error("Unexpected error in getPlayers", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function getPlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const player = await getPlayerById(id);

    if (!player) {
      return sendError(res, 404, "PLAYER_NOT_FOUND", "Jugador no encontrado");
    }

    return sendSuccess(res, 200, player);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Parámetros inválidos", error.issues);
    }

    logger.error("Unexpected error in getPlayer", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function postPlayer(req: Request, res: Response) {
  try {
    const parsed = createPlayerSchema.parse(req.body);
    const data = {
      ...parsed,
      photoUrl: parsed.photoUrl,
      currentTeamId: parsed.currentTeamId,
    };

    const player = await createPlayer(data);
    return sendSuccess(res, 201, player);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Payload inválido", error.issues);
    }

    if (error instanceof Error && error.message === "TEAM_NOT_FOUND") {
      return sendError(res, 400, "VALIDATION_ERROR", "Equipo no encontrado");
    }

    logger.error("Unexpected error in postPlayer", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function patchPlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const parsed = updatePlayerSchema.parse(req.body);
    const data = omitUndefined(parsed);
    const player = await updatePlayer(id, data);

    return sendSuccess(res, 200, player);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Payload inválido", error.issues);
    }

    if (error instanceof Error && error.message === "TEAM_NOT_FOUND") {
      return sendError(res, 400, "VALIDATION_ERROR", "Equipo no encontrado");
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return sendError(res, 404, "PLAYER_NOT_FOUND", "Jugador no encontrado");
    }

    logger.error("Unexpected error in patchPlayer", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function removePlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    await deletePlayer(id);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Parámetros inválidos", error.issues);
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return sendError(res, 404, "PLAYER_NOT_FOUND", "Jugador no encontrado");
    }

    logger.error("Unexpected error in removePlayer", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}