import type { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { slowDown } from 'express-slow-down'
import { CustomError } from './customError.ts'

export const apiRateThrottle = slowDown({
    windowMs: 5 * 60 * 1000,
    delayAfter: 1000,
    delayMs: (hits) => hits * 1,
})

export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler: (req: Request, res: Response, next: NextFunction) => next(new CustomError("Rate limit exceeded", 429))
}) 