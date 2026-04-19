import type { Request, Response } from "express";
import { z } from "zod";
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

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Query inválida",
        issues: error.issues,
      });
    }

    logger.error("Unexpected error in getPlayerStats", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function comparePlayersController(req: Request, res: Response) {
  try {
    const query = compareQuerySchema.parse(req.query);

    if (query.ids.length < 2 || query.ids.length > 3) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Debes comparar entre 2 y 3 jugadores",
      });
    }

    const players = await comparePlayerStats(query.ids);

    return res.status(200).json({
      success: true,
      data: players,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Query inválida",
        issues: error.issues,
      });
    }

    if (error instanceof Error && error.message === "SOME_PLAYERS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Uno o más jugadores no existen",
      });
    }

    if (error instanceof Error && error.message === "INVALID_PLAYER_IDS") {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "IDs de jugadores inválidos",
      });
    }

    logger.error("Unexpected error in comparePlayersController", {
      method: req.method,
      path: req.originalUrl,
      error,
    });

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}
