export type PlayerStatsInput = {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
};

export type PlayerStatsResponse = PlayerStatsInput & {
  id: string;
  playerId: string;
  seasonId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ComparePlayersQuery = {
  ids: string[];
};
