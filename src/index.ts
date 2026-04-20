import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/openapi";
import { sendError, sendSuccess } from "./lib/http";
import { logger } from "./lib/logger";
import { authRoutes } from "./routes/auth.routes";
import { playersRoutes } from "./routes/players.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms", {
		stream: {
			write: (message) => logger.info(message.trim()),
		},
	})
);

app.get("/health", (_req, res) => {
	return sendSuccess(res, 200, { ok: true });
});

app.get("/docs.json", (_req, res) => {
	return res.status(200).json(openApiSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/auth", authRoutes);
app.use("/players", playersRoutes);

app.use((req, res) => {
	return sendError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`);
});

app.listen(port, () => {
	logger.info(`API listening on http://localhost:${port}`);
});
