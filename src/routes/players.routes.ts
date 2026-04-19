import { Router } from "express";
import { getPlayer, getPlayers, patchPlayer, postPlayer, removePlayer } from "../controllers/players.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const playersRoutes = Router();

playersRoutes.use(requireAuth);

playersRoutes.get("/", getPlayers);
playersRoutes.get("/:id", getPlayer);
playersRoutes.post("/", postPlayer);
playersRoutes.patch("/:id", patchPlayer);
playersRoutes.delete("/:id", removePlayer);