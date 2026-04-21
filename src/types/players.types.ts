import { Position, type Prisma } from "@prisma/client";

export type ListPlayersFilters = {
  search?: string | undefined;
  position?: Position | undefined;
  nationality?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
};

export type ListPlayersPagination = {
  page: number;
  limit: number;
};

export type ListPlayersParams = {
  filters: ListPlayersFilters;
  pagination: ListPlayersPagination;
};

export type PaginatedPlayersResult<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreatePlayerInput = {
  name: string;
  birthDate: Date;
  nationality: string;
  position: Position;
  photoUrl?: string | undefined;
  currentTeamId?: string | undefined;
};

export type UpdatePlayerInput = Partial<
  Pick<CreatePlayerInput, "name" | "nationality" | "position" | "photoUrl"> & {
    currentTeamId: string | null;
  }
>;

export type PlayerSelectableTeam = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type PlayerSelectableOptions = {
  teams: PlayerSelectableTeam[];
  nationalities: string[];
  positions: Position[];
};