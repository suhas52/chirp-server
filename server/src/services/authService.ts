import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prismaConfig.ts'
import envConf from '../lib/envConfig.ts'

const salt = envConf.SALT

type registerData = {
    firstName: string,
    lastName: string,
    username: string,
    password: string
}

export const register = async (data: registerData) => {
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