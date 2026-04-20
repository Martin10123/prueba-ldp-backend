-- Add soft-delete flag to players
ALTER TABLE "players"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "players_is_active_idx" ON "players"("is_active");
