import { type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreatePlayerInput, ListPlayersParams, PaginatedPlayersResult, UpdatePlayerInput } from "../types/players.types";

function getBirthDateRangeFromAge(minAge?: number, maxAge?: number) {
  const today = new Date();
  const range: { gte?: Date; lte?: Date } = {};

  if (typeof maxAge === "number") {
    const lowerBound = new Date(today);
    lowerBound.setFullYear(today.getFullYear() - maxAge - 1);
    lowerBound.setDate(lowerBound.getDate() + 1);
    range.gte = lowerBound;
  }

  if (typeof minAge === "number") {
    const upperBound = new Date(today);
    upperBound.setFullYear(today.getFullYear() - minAge);
    range.lte = upperBound;
  }

  return range;
}

export async function listPlayers({ filters, pagination }: ListPlayersParams): Promise<PaginatedPlayersResult<Prisma.PlayerGetPayload<object>>> {
  const where: Prisma.PlayerWhereInput = {};

  if (filters.search) {
    where.name = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters.position) {
    where.position = filters.position;
  }

  if (filters.nationality) {
    where.nationality = {
      equals: filters.nationality,
      mode: "insensitive",
    };
  }

  if (typeof filters.minAge === "number" || typeof filters.maxAge === "number") {
    where.birthDate = getBirthDateRangeFromAge(filters.minAge, filters.maxAge);
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.player.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    }),
    prisma.player.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getPlayerById(id: string) {
  return prisma.player.findUnique({ where: { id } });
}

export function createPlayer(data: CreatePlayerInput) {
  const normalizedData = {
    ...data,
    photoUrl: data.photoUrl ?? null,
    currentTeamId: data.currentTeamId ?? null,
  };
  return prisma.player.create({ data: normalizedData });
}

export function updatePlayer(id: string, data: UpdatePlayerInput) {
  return prisma.player.update({
    where: { id },
    data,
  });
}

export function deletePlayer(id: string) {
  return prisma.player.delete({ where: { id } });
}