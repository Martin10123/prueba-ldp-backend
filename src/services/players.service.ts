import { type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreatePlayerInput, ListPlayersParams, PaginatedPlayersResult, UpdatePlayerInput } from "../types/players.types";

type PlayerWithTeamName = Prisma.PlayerGetPayload<{
  include: {
    currentTeam: {
      select: {
        name: true;
      };
    };
  };
}>;

export type PlayerResponse = Omit<PlayerWithTeamName, "currentTeam"> & {
  currentTeamName: string | null;
};

function mapPlayerToResponse(player: PlayerWithTeamName): PlayerResponse {
  const { currentTeam, ...rest } = player;

  return {
    ...rest,
    currentTeamName: currentTeam?.name ?? null,
  };
}

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

export async function listPlayers({ filters, pagination }: ListPlayersParams): Promise<PaginatedPlayersResult<PlayerResponse>> {
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
      include: {
        currentTeam: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.player.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: items.map(mapPlayerToResponse),
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

export async function getPlayerById(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      currentTeam: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  return mapPlayerToResponse(player);
}

export async function createPlayer(data: CreatePlayerInput) {
  const normalizedData = {
    ...data,
    photoUrl: data.photoUrl ?? null,
    currentTeamId: data.currentTeamId ?? null,
  };

  const player = await prisma.player.create({
    data: normalizedData,
    include: {
      currentTeam: {
        select: {
          name: true,
        },
      },
    },
  });

  return mapPlayerToResponse(player);
}

export async function updatePlayer(id: string, data: UpdatePlayerInput) {
  const player = await prisma.player.update({
    where: { id },
    data,
    include: {
      currentTeam: {
        select: {
          name: true,
        },
      },
    },
  });

  return mapPlayerToResponse(player);
}

export function deletePlayer(id: string) {
  return prisma.player.delete({ where: { id } });
}