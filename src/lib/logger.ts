import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import winston from "winston";

const isDevelopment = process.env.NODE_ENV !== "production";

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const serializedMeta = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    const errorStack = stack ? `\n${stack}` : "";
    return `${timestamp} ${level}: ${message}${serializedMeta}${errorStack}`;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
  format: isDevelopment ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: prodFormat,
    }),
  ],
});
