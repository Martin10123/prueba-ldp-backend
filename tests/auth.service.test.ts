import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prismaUserCreate: vi.fn(),
  prismaUserFindUnique: vi.fn(),
  hashMock: vi.fn(),
  compareMock: vi.fn(),
  signAuthTokenMock: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hashMock,
    compare: mocks.compareMock,
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      create: mocks.prismaUserCreate,
      findUnique: mocks.prismaUserFindUnique,
    },
  },
}));

vi.mock("../src/lib/jwt", () => ({
  signAuthToken: mocks.signAuthTokenMock,
}));

import { loginUser, registerUser } from "../src/services/auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hashMock.mockResolvedValue("hashed-password");
    mocks.signAuthTokenMock.mockReturnValue("signed-token");
  });

  it("registerUser hashes password, lowercases email and returns token", async () => {
    mocks.prismaUserCreate.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "hashed-password",
      role: "USER",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    });

    const result = await registerUser({
      name: "Ana",
      email: "ANA@EXAMPLE.COM",
      password: "secret123",
    });

    expect(mocks.hashMock).toHaveBeenCalledWith("secret123", 10);
    expect(mocks.prismaUserCreate).toHaveBeenCalledWith({
      data: {
        name: "Ana",
        email: "ana@example.com",
        passwordHash: "hashed-password",
      },
    });
    expect(mocks.signAuthTokenMock).toHaveBeenCalledWith({
      sub: "user-1",
      email: "ana@example.com",
      role: "USER",
    });
    expect(result).toEqual({
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@example.com",
        role: "USER",
        createdAt: new Date("2026-04-20T00:00:00.000Z"),
        updatedAt: new Date("2026-04-20T00:00:00.000Z"),
      },
      token: "signed-token",
    });
  });

  it("registerUser maps unique email violations", async () => {
    mocks.prismaUserCreate.mockRejectedValue({ code: "P2002" });

    await expect(
      registerUser({
        name: "Ana",
        email: "ana@example.com",
        password: "secret123",
      })
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  it("loginUser returns a token for valid credentials", async () => {
    mocks.prismaUserFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "hashed-password",
      role: "USER",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    });
    mocks.compareMock.mockResolvedValue(true);

    const result = await loginUser({
      email: "ANA@EXAMPLE.COM",
      password: "secret123",
    });

    expect(mocks.prismaUserFindUnique).toHaveBeenCalledWith({
      where: { email: "ana@example.com" },
    });
    expect(mocks.compareMock).toHaveBeenCalledWith("secret123", "hashed-password");
    expect(mocks.signAuthTokenMock).toHaveBeenCalledWith({
      sub: "user-1",
      email: "ana@example.com",
      role: "USER",
    });
    expect(result.token).toBe("signed-token");
    expect(result.user.email).toBe("ana@example.com");
  });

  it("loginUser rejects invalid credentials", async () => {
    mocks.prismaUserFindUnique.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "hashed-password",
      role: "USER",
      createdAt: new Date("2026-04-20T00:00:00.000Z"),
      updatedAt: new Date("2026-04-20T00:00:00.000Z"),
    });
    mocks.compareMock.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "ana@example.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });
});