import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prismaConfig.ts'
import envConf from '../lib/envConfig.ts'
import type { NextFunction } from 'express'
import { CustomError } from '../lib/customError.ts'
import sharp from 'sharp';
import { getSignedImageUrl, uploadToCloud } from "../lib/s3Config.ts";
import * as types from '../lib/types.ts'

const salt = envConf.SALT



const allowedFileTypes = ["image/jpeg", "image/png"];

export const register = async (data: types.registerData) => {
    const passwordHash = await bcrypt.hash(data.password, salt)
    return await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            passwordHash: passwordHash
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            createdAt: true
        }
    })
}

export const login = async (data: types.loginData) => {
    const user = await prisma.user.findUnique({
        where: { username: data.username },
        select: {
            id: true,
            username: true,
            passwordHash: true,
            firstName: true,
            lastName: true
        },
    })
    if (!user) throw new CustomError("Invalid Credentials", 401)
    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)
    if (!passwordMatch) throw new CustomError("Invalid Credentials", 401)
    return user;
}

export const meService = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarFileName: true
        }
    })
    if (!user) throw new CustomError("User does not exist", 401)
    const avatarUrl = await getSignedImageUrl(user.avatarFileName)
    return { ...user, avatarUrl };
}

export const updateProfileService = async (id: string, formData: any) => {
    try {
        const modifiedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: formData,
        })
        return modifiedUser;
    } catch (err) {
        throw new CustomError("Failed to update user details", 400)
    }

}

export const updateAvatarService = async (image: Express.Multer.File, id: string) => {
    try {
        if (!allowedFileTypes.includes(image.mimetype)) throw new CustomError("Invalid file type", 400)
        const processedImageBuffer = await sharp(image.buffer).resize(200).png().toBuffer();
        const avatarFileName = await uploadToCloud(processedImageBuffer);
        const updatedAvatarFileName = await prisma.user.update({
            where: { id: id },
            data: {
                avatarFileName: avatarFileName
            },
            select: {
                avatarFileName: true
            }
        })
        return updatedAvatarFileName;
    } catch (err) {
        throw new CustomEvent("Todo")
    }

}