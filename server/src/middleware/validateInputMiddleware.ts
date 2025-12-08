import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType } from 'zod';
import { CustomError } from '../lib/customError.ts';


function formatZodErrors(error: ZodError) {
    let errors: any = {}
    error.issues.forEach(err => {
        const key = err.path.join(".")
        errors[key] = err.message;
    })
    return errors
}


export const validateInput = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        const error: ZodError = parsed.error;
        const errorData = formatZodErrors(error);
        const errorMessage = error.issues[0] ? error.issues[0].message : "Unknown error"
        throw new CustomError(errorMessage, 400)
    }
    next();
}