import type { NextFunction, Request, Response } from "express";
import { loginSchema, profileSchema, registerSchema } from "../zodSchemas/authSchemas.ts";
import bcrypt from 'bcryptjs'
import { CustomError } from "../lib/customError.ts";
import { prisma } from "../lib/prismaConfig.ts";
import { successResponse } from "../lib/response.ts";
import envConf from "../lib/envConfig.ts";
import jwt from 'jsonwebtoken'
import sharp from 'sharp';
import { getSignedImageUrl, uploadToCloud } from "../lib/s3Config.ts";
import * as authService from '../services/authService.ts'

const salt = envConf.SALT;
const jwtSecret = envConf.JWT_SECRET;

const allowedFileTypes = ["image/jpeg", "image/png"];

interface DecodedUser {
    id: string;
    username: string;
    iat: number;
    exp: number;
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body
    const newUser = await authService.register(formData)
    return successResponse(res, 201, newUser)
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    const user = await prisma.user.findUnique({
        where: { username: formData.username },
        select: {
            id: true,
            username: true,
            passwordHash: true,
            firstName: true,
            lastName: true
        },
    })
    if (!user) return next(new CustomError("Invalid Credentials", 401))
    const passwordMatch = await bcrypt.compare(formData.password, user.passwordHash)
    if (!passwordMatch) return next(new CustomError("Invalid Credentials", 401))
    const accessToken = jwt
        .sign({ id: user.id, username: user.username }, jwtSecret, {
            expiresIn: 7 * 24 * 60 * 60,

        })

    res.status(200).cookie("token", accessToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({
        success: true,
        data: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName }
    })
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    successResponse(res.clearCookie("token"), 200)
}

export const meController = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    const accessToken = req.cookies.token;
    const decodedUser = jwt.verify(accessToken, jwtSecret) as DecodedUser;
    const user = await prisma.user.findUnique({
        where: { id: decodedUser.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarFileName: true
        }
    })
    if (!user) return next(new CustomError("User does not exist", 401))
    const avatarUrl = await getSignedImageUrl(user.avatarFileName)
    return successResponse(res, 200, { ...user, avatarUrl })

}

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;

    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    const accessToken = req.cookies.token;
    if (!formData) return next(new CustomError("Invalid input", 400))
    const decodedUser = jwt.verify(accessToken, jwtSecret) as DecodedUser;
    const modifiedUser = await prisma.user.update({
        where: {
            id: decodedUser.id
        },
        data: formData,
    })
    return successResponse(res, 204)
}

export const updateAvatarController = async (req: Request, res: Response, next: NextFunction) => {

    const image = req.file;
    if (!req.cookies.token) return next(new CustomError("User not logged in", 401))
    const accessToken = req.cookies.token;
    const decodedUser = jwt.verify(accessToken, jwtSecret) as DecodedUser;
    if (!image) return next(new CustomError("Image not provided", 400))
    if (!allowedFileTypes.includes(image.mimetype)) return next(new CustomError("Invalid file type", 400))
    const processedImageBuffer = await sharp(image.buffer).resize(200).png().toBuffer();
    const avatarFileName = await uploadToCloud(processedImageBuffer);
    const updatedAvatarFileName = await prisma.user.update({
        where: { id: decodedUser.id },
        data: {
            avatarFileName: avatarFileName
        }
    })
    return successResponse(res, 200, { avatarFileName: avatarFileName })
}