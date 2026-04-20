process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/scout_panel?schema=public";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-key-123456";