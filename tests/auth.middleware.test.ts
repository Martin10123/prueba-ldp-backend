import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicUser } from "../src/types/auth";

type AuthenticatedRequest = Request & {
  user?: PublicUser;
};

const mocks = vi.hoisted(() => ({
  prismaUserFindUnique: vi.fn(),
  verifyAuthTokenMock: vi.fn(),
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.prismaUserFindUnique,
    },
  },
}));

vi.mock("../src/lib/jwt", () => ({
  verifyAuthToken: mocks.verifyAuthTokenMock,
}));

import { requireAuth } from "../src/middlewares/auth.middleware";

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  return res;
}

describe("middleware de autenticación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza cuando falta el bearer token", async () => {
    const req = { headers: {} } as Request;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "UNAUTHORIZED",
      message: "Token de autenticación no proporcionado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza tokens cuyo usuario ya no existe", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    mocks.verifyAuthTokenMock.mockReturnValue({
      sub: "user-1",
      email: "ana@example.com",
      role: "USER",
    });
    mocks.prismaUserFindUnique.mockResolvedValue(null);

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "UNAUTHORIZED",
      message: "El usuario correspondiente al token no existe",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("adjunta el usuario al request y continúa", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } } as AuthenticatedRequest;
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    mocks.verifyAuthTokenMock.mockReturnValue({
      sub: "user-1",
      email: "ana@example.com",
      role: "USER",
    });
    mocks.prismaUserFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      role: "USER",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    });

    await requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      role: "USER",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});