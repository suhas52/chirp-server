import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prismaConfig.ts'
import envConf from '../lib/envConfig.ts'
import { CustomError } from '../lib/customError.ts'
import { getSignedImageUrl, uploadToCloud } from "../lib/s3Config.ts";
import * as types from '../lib/types.ts'
import processImage from '../lib/processImage.ts';

const salt = envConf.SALT


export const register = async (data: types.registerData) => {
    const passwordHash = await bcrypt.hash(data.password, salt)
    return await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            passwordHash: passwordHash,
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

export const getUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarFileName: true,
            bio: true
        }
    })
    if (!user) throw new CustomError("User does not exist", 401)
    const avatarUrl = await getSignedImageUrl(user.avatarFileName, "avatar")
    return { ...user, avatarUrl };
}

export const updateProfile = async (id: string, formData: types.profileFormData) => {
    if (!Object.keys(formData).length) {
        throw new CustomError("Invalid input", 400)
    }
    const modifiedUser = await prisma.user.update({
        where: {
            id: id
        },
        data: formData,
    })
    return modifiedUser;
}

export const updateAvatar = async (image: Express.Multer.File, id: string) => {
    const processedImageBuffer = await processImage(image);
    const avatarFileName = await uploadToCloud(processedImageBuffer, "avatar");
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
}