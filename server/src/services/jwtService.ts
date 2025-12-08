import type { NextFunction } from "express";
import envConf from "../lib/envConfig.ts";
import jwt from 'jsonwebtoken';
import { CustomError } from "../lib/customError.ts";

const jwtSecret = envConf.JWT_SECRET;

type jwtUser = {
    id: string,
    username: string
}

interface DecodedUser {
    id: string;
    username: string;
    iat: number;
    exp: number;
}

export const signJwt = (user: jwtUser) => {
    const accessToken = jwt
        .sign({ id: user.id, username: user.username }, jwtSecret, {
            expiresIn: 7 * 24 * 60 * 60,

        })
    return accessToken;
}

export const validateJwt = (accessToken: string) => {
    try {
        const decodedUser = jwt.verify(accessToken, jwtSecret) as DecodedUser;
        return decodedUser;
    } catch (err) {
        throw new CustomError("Failed to verify user, please login again", 401)
    }
}