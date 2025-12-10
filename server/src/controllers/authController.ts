import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/customError.ts";
import { successResponse } from "../lib/response.ts";
import * as authService from '../services/authService.ts'
import * as jwtService from "../services/jwtService.ts";


export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const newUser = await authService.register(body)
    return successResponse(res, 201, newUser)
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const user = await authService.login(body)
    const accessToken = jwtService.signJwt({ username: user.username, id: user.id })

    res.cookie("token", accessToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return successResponse(res, 200, {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
    })
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    successResponse(res.clearCookie("token"), 200)
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
    const { decodedUser } = req
    const user = await authService.me(decodedUser.id)
    return successResponse(res, 200, { ...user })
}

export const profile = async (req: Request, res: Response, next: NextFunction) => {
    const { body, decodedUser } = req
    if (!body) return next(new CustomError("Invalid input", 400))
    const modifiedUser = await authService.updateProfile(decodedUser.id, body)
    return successResponse(res, 200, modifiedUser)
}

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const { decodedUser } = req
    const image = req.file;
    if (!image) return next(new CustomError("Image not provided", 400))
    const updatedAvatarFileName = await authService.updateAvatar(image, decodedUser.id)
    return successResponse(res, 200, { updatedAvatarFileName })
}