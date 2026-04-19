import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signAuthToken } from "../lib/jwt";
import type { LoginInput, PublicUser, RegisterInput } from "../types/auth";

function sanitizeUser(user: PublicUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
      },
    });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email.toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}