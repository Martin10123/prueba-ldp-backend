import { Position, type Prisma } from "@prisma/client";

export type ListPlayersFilters = {
  search?: string | undefined;
  position?: Position | undefined;
  nationality?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
};

export type CreatePlayerInput = {
  name: string;
  birthDate: Date;
  nationality: string;
  position: Position;
  photoUrl?: string | null;
  currentTeam: string;
};

export type UpdatePlayerInput = Prisma.PlayerUpdateInput;