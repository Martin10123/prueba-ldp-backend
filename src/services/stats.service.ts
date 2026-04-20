import { prisma } from "../lib/prisma";

export async function getPlayerStatsBySeason(playerId: string, seasonId?: string) {
  const player = await prisma.player.findFirst({
    where: {
      id: playerId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!player) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  const where: { playerId: string; seasonId?: string } = { playerId };
  if (seasonId) {
    where.seasonId = seasonId;
  }

  return prisma.playerStats.findMany({
    where,
    include: {
      season: true,
      team: true,
    },
    orderBy: {
      season: {
        year: "desc" as any,
      },
    },
  });
}

export async function comparePlayerStats(playerIds: string[]) {
  if (!playerIds.length) {
    throw new Error("INVALID_PLAYER_IDS");
  }

  const playersWithStats = await prisma.player.findMany({
    where: {
      isActive: true,
      id: {
        in: playerIds,
      },
    },
    include: {
      currentTeam: true,
      stats: {
        include: {
          season: true,
          team: true,
        },
        orderBy: {
          season: {
            year: "desc" as any,
          },
        },
        take: 2,
      },
    },
  });

  if (playersWithStats.length !== playerIds.length) {
    throw new Error("SOME_PLAYERS_NOT_FOUND");
  }

  return playersWithStats;
}
