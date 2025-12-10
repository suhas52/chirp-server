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
