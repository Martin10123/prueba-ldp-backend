import { Position } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { createPlayer, deletePlayer, getPlayerById, listPlayers, updatePlayer } from "../services/players.service";

const listPlayersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  position: z.nativeEnum(Position).optional(),
  nationality: z.string().trim().min(1).optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
});

const createPlayerSchema = z.object({
  name: z.string().trim().min(2),
  birthDate: z.coerce.date(),
  nationality: z.string().trim().min(2),
  position: z.nativeEnum(Position),
  photoUrl: z.string().trim().url().optional(),
  currentTeam: z.string().trim().min(2),
});

const updatePlayerSchema = createPlayerSchema.partial().refine((data) => Object.keys(data).length > 0, {
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
    const filters = listPlayersSchema.parse(req.query);

    if (
      typeof filters.minAge === "number" &&
      typeof filters.maxAge === "number" &&
      filters.minAge > filters.maxAge
    ) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "minAge no puede ser mayor que maxAge",
      });
    }

    const players = await listPlayers(filters);
    return res.status(200).json({ data: players });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Parámetros inválidos",
        issues: error.issues,
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function getPlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const player = await getPlayerById(id);

    if (!player) {
      return res.status(404).json({
        error: "PLAYER_NOT_FOUND",
        message: "Jugador no encontrado",
      });
    }

    return res.status(200).json({ data: player });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Parámetros inválidos",
        issues: error.issues,
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function postPlayer(req: Request, res: Response) {
  try {
    const parsed = createPlayerSchema.parse(req.body);
    const data = {
      ...parsed,
      photoUrl: parsed.photoUrl ?? null,
    };

    const player = await createPlayer(data);
    return res.status(201).json({ data: player });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Payload inválido",
        issues: error.issues,
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function patchPlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const parsed = updatePlayerSchema.parse(req.body);
    const data = omitUndefined(parsed);
    const player = await updatePlayer(id, data);

    return res.status(200).json({ data: player });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Payload inválido",
        issues: error.issues,
      });
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return res.status(404).json({
        error: "PLAYER_NOT_FOUND",
        message: "Jugador no encontrado",
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}

export async function removePlayer(req: Request, res: Response) {
  try {
    const { id } = idParamsSchema.parse(req.params);
    await deletePlayer(id);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Parámetros inválidos",
        issues: error.issues,
      });
    }

    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return res.status(404).json({
        error: "PLAYER_NOT_FOUND",
        message: "Jugador no encontrado",
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Error inesperado",
    });
  }
}