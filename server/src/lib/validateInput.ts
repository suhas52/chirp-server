import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod';
import { CustomError } from './customError.ts';

export const validateInput = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(new CustomError(parsed.error.message, 400));
    next();
}