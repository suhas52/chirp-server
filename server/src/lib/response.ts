import { type Response } from "express";

export function successResponse<T>(
  res: Response,
  status: number,
  data?: T
) {
  return res.status(status).json({
    success: true,
    data
  })
}

export function failureResponse(
  res: Response,
  status: number,
  message: string,
  details?: unknown
) {
  return res.status(status).json({
    success: false,
    message,
    details: details ?? null
  });
}