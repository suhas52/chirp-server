import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/customError.ts";
import envConf from "../lib/envConfig.ts";
import jwt from 'jsonwebtoken'
import type { DecodedUser } from "../lib/types.ts";

const jwtSecret = envConf.JWT_SECRET;



export const validateJwt = () => (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.cookies.token;
    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    try {
        const decodedUser = jwt.verify(accessToken, jwtSecret) as DecodedUser;
        req.decodedUser = decodedUser
        return next();
    } catch {
        return next(new CustomError("Failed to verify user, please login again", 401))
    }

}