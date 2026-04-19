import { Router } from "express";
import { comparePlayersController, getPlayerStats } from "../controllers/stats.controller";
import { getPlayer, getPlayers, patchPlayer, postPlayer, removePlayer } from "../controllers/players.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const playersRoutes = Router();

playersRoutes.use(requireAuth);

playersRoutes.get("/", getPlayers);
playersRoutes.get("/compare", comparePlayersController);
playersRoutes.get("/:id", getPlayer);
playersRoutes.get("/:id/stats", getPlayerStats);
playersRoutes.post("/", postPlayer);
playersRoutes.patch("/:id", patchPlayer);
playersRoutes.delete("/:id", removePlayer);