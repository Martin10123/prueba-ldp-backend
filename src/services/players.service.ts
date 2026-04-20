import { Position, type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  CreatePlayerInput,
  ListPlayersParams,
  PaginatedPlayersResult,
  PlayerSelectableOptions,
  UpdatePlayerInput,
} from "../types/players.types";

type PlayerWithTeamName = Prisma.PlayerGetPayload<{
  include: {
    currentTeam: {
      select: {
        name: true;
      };
    };
  };
}>;

export type PlayerResponse = Omit<PlayerWithTeamName, "currentTeam" | "currentTeamId"> & {
  currentTeamId: string | null;
  currentTeamName: string | null;
};

async function ensureTeamExists(teamId: string): Promise<void> {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
    },
  });

  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }
}

async function ensureNationalityExists(nationality: string): Promise<void> {
  const existingNationality = await prisma.player.findFirst({
    where: {
      nationality: {
        equals: nationality,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });

  if (!existingNationality) {
    throw new Error("NATIONALITY_NOT_ALLOWED");
  }
}

function mapPlayerToResponse(player: PlayerWithTeamName): PlayerResponse {
  const { currentTeam, currentTeamId, ...rest } = player;

  return {
    ...rest,
    currentTeamId,
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
  const where: Prisma.PlayerWhereInput = {
    isActive: true,
  };

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
      contains: filters.nationality,
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
  const player = await prisma.player.findFirst({
    where: {
      id,
      isActive: true,
    },
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

export async function listPlayerSelectableOptions(): Promise<PlayerSelectableOptions> {
  const [teams, nationalityRows] = await Promise.all([
    prisma.team.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.player.findMany({
      select: {
        nationality: true,
      },
      where: {
        isActive: true,
      },
      distinct: ["nationality"],
      orderBy: {
        nationality: "asc",
      },
    }),
  ]);

  return {
    teams,
    nationalities: nationalityRows.map((item) => item.nationality),
    positions: Object.values(Position),
  };
}

export async function createPlayer(data: CreatePlayerInput) {
  if (data.currentTeamId) {
    await ensureTeamExists(data.currentTeamId);
  }

  const player = await prisma.player.create({
    data: {
      name: data.name,
      birthDate: data.birthDate,
      nationality: data.nationality,
      position: data.position,
      photoUrl: data.photoUrl ?? null,
      ...(data.currentTeamId
        ? {
            currentTeam: {
              connect: {
                id: data.currentTeamId,
              },
            },
          }
        : {}),
    },
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
  const existingPlayer = await prisma.player.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!existingPlayer) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  const updateData: Prisma.PlayerUpdateInput = {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
    ...(data.position !== undefined ? { position: data.position } : {}),
    ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
  };

  if (data.nationality !== undefined) {
    await ensureNationalityExists(data.nationality);
  }

  if (data.currentTeamId !== undefined) {
    if (data.currentTeamId === null) {
      updateData.currentTeam = {
        disconnect: true,
      };
    } else {
      await ensureTeamExists(data.currentTeamId);
      updateData.currentTeam = {
        connect: {
          id: data.currentTeamId,
        },
      };
    }
  }

  const player = await prisma.player.update({
    where: { id },
    data: updateData,
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

export async function deletePlayer(id: string) {
  const existingPlayer = await prisma.player.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!existingPlayer) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  const player = await prisma.player.update({
    where: { id },
    data: {
      isActive: false,
    },
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