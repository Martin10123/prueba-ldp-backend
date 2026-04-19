import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRoutes } from "./routes/auth.routes";
import { playersRoutes } from "./routes/players.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/players", playersRoutes);

app.use((req, res) => {
	res.status(404).json({
		error: "NOT_FOUND",
		message: `Route ${req.method} ${req.originalUrl} not found`,
	});
});

app.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});
