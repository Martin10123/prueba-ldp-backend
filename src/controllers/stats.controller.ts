import type { Request, Response } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../lib/http";
import { logger } from "../lib/logger";
import { comparePlayerStats, getPlayerStatsBySeason } from "../services/stats.service";

const idParamsSchema = z.object({
  id: z.string().min(1),
});

const statsQuerySchema = z.object({
  seasonId: z.string().optional(),
});

const compareQuerySchema = z.object({
  ids: z.string().transform((val) => val.split(",").filter((id) => id.length > 0)),
});

export async function getPlayerStats(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const query = statsQuerySchema.parse(req.query);

    const stats = await getPlayerStatsBySeason(id, query.seasonId);

    return sendSuccess(res, 200, stats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Query inválida", error.issues);
    }

    if (error instanceof Error && error.message === "PLAYER_NOT_FOUND") {
      return sendError(res, 404, "PLAYER_NOT_FOUND", "Jugador no encontrado");
    }

    logger.error("Unexpected error in getPlayerStats", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}

export async function comparePlayersController(req: Request, res: Response) {
  try {
    const query = compareQuerySchema.parse(req.query);

    if (query.ids.length < 2 || query.ids.length > 3) {
      return sendError(res, 400, "VALIDATION_ERROR", "Debes comparar entre 2 y 3 jugadores");
    }

    const players = await comparePlayerStats(query.ids);

    return sendSuccess(res, 200, players);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "VALIDATION_ERROR", "Query inválida", error.issues);
    }

    if (error instanceof Error && error.message === "SOME_PLAYERS_NOT_FOUND") {
      return sendError(res, 404, "NOT_FOUND", "Uno o más jugadores no existen");
    }

    if (error instanceof Error && error.message === "INVALID_PLAYER_IDS") {
      return sendError(res, 400, "VALIDATION_ERROR", "IDs de jugadores inválidos");
    }

    logger.error("Unexpected error in comparePlayersController", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Error inesperado");
  }
}
