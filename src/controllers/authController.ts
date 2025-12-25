import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/customError.ts";
import { successResponse } from "../lib/response.ts";
import * as authService from '../services/authService.ts'
import * as jwtService from "../services/jwtService.ts";


export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { validatedInput } = req
    const newUser = await authService.register(validatedInput)
    return successResponse(res, 201, newUser)
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { validatedInput } = req
    const user = await authService.login(validatedInput)
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
    const user = await authService.getUser(decodedUser.id)
    return successResponse(res, 200, { ...user })
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next(new CustomError("UserId is required", 400))
    const loggedUserId = req.query.loggedUserId ? String(req.query.loggedUserId) : undefined
    const user = await authService.getUser(userId, loggedUserId)
    return successResponse(res, 200, { ...user })
}

export const profile = async (req: Request, res: Response, next: NextFunction) => {
    const { validatedInput, decodedUser } = req
    const modifiedUser = await authService.updateProfile(decodedUser.id, validatedInput)
    return successResponse(res, 200, modifiedUser)
}

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const { decodedUser } = req
    const image = req.file;
    if (!image) return next(new CustomError("Image not provided", 400))
    const updatedAvatarFileName = await authService.updateAvatar(image, decodedUser.id)
    return successResponse(res, 200, { updatedAvatarFileName })
}