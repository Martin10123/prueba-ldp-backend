import type { Response } from "express";
import type { ApiErrorResponse, ApiSuccessResponse } from "../types/api";

export function sendSuccess<T>(res: Response, status: number, data: T) {
  return res.status(status).json({
    success: true,
    data,
  } satisfies ApiSuccessResponse<T>);
}

export function sendError<TIssues = unknown>(
  res: Response,
  status: number,
  error: string,
  message: string,
  issues?: TIssues
) {
  const payload: ApiErrorResponse<TIssues> = {
    success: false,
    error,
    message,
    ...(issues !== undefined ? { issues } : {}),
  };

  return res.status(status).json(payload);
}