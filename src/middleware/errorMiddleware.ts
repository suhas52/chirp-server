import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.ts";


interface CustomError<TData = unknown> extends Error {
    statusCode?: number;
    status?: string;
    data?: TData;
}

export const globalErrorHandler = (
    error: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = error.statusCode ?? 500;
    let message = error.status ?? "Internal server error";
    let data = error.data ?? undefined;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const target = error.meta?.modelName
        switch (error.code) {
            case "P2002":
                statusCode = 409;
                message = `${target} already exists`;
                break;

            case "P2025":
                statusCode = 404;
                message = "Resource not found";
                break;

            case "P2003":
                statusCode = 400;
                message = "Invalid reference";
                break;

            default:
                statusCode = 500;
                message = "Database error";
        }

    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid database query";
    }

    if (statusCode === 500) {
        console.error(error);
    }
    console.log(error)
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        ...(data !== undefined && { data })
    });
};