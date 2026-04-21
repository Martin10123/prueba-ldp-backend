import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPlayersMock: vi.fn(),
  comparePlayerStatsMock: vi.fn(),
}));

vi.mock("../src/services/players.service", () => ({
  createPlayer: vi.fn(),
  deletePlayer: vi.fn(),
  getPlayerById: vi.fn(),
  listPlayerSelectableOptions: vi.fn(),
  listPlayers: mocks.listPlayersMock,
  updatePlayer: vi.fn(),
}));

vi.mock("../src/services/stats.service", () => ({
  comparePlayerStats: mocks.comparePlayerStatsMock,
  getPlayerStatsBySeason: vi.fn(),
}));

import { getPlayers } from "../src/controllers/players.controller";
import { comparePlayersController } from "../src/controllers/stats.controller";

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  return res;
}

describe("controladores de jugadores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe listar jugadores correctamente", async () => {
    const req = {
      query: {
        search: "ana",
        page: "1",
        limit: "2",
      },
      method: "GET",
      originalUrl: "/players",
    } as unknown as Request;
    const res = createResponse();

    const playersResult = {
      items: [
        {
          id: "player-1",
          name: "Ana",
        },
      ],
      page: 1,
      limit: 2,
      total: 1,
      totalPages: 1,
    };

    mocks.listPlayersMock.mockResolvedValue(playersResult);

    await getPlayers(req, res);

    expect(mocks.listPlayersMock).toHaveBeenCalledWith({
      filters: {
        search: "ana",
      },
      pagination: {
        page: 1,
        limit: 2,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: playersResult,
    });
  });

  it("debe comparar jugadores correctamente", async () => {
    const req = {
      query: {
        ids: "player-1,player-2",
      },
      method: "GET",
      originalUrl: "/players/compare",
    } as unknown as Request;
    const res = createResponse();

    const compareResult = [
      {
        id: "player-1",
        name: "Ana",
        stats: [],
      },
      {
        id: "player-2",
        name: "Luis",
        stats: [],
      },
    ];

    mocks.comparePlayerStatsMock.mockResolvedValue(compareResult);

    await comparePlayersController(req, res);

    expect(mocks.comparePlayerStatsMock).toHaveBeenCalledWith(["player-1", "player-2"]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: compareResult,
    });
  });
});
