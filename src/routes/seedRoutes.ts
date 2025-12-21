import { Router, type NextFunction, type Request, type Response } from "express";
import envConf from "../lib/envConfig.ts";
import { registerSchema } from "../zodSchemas/authSchemas.ts";
import { prisma } from '../lib/prismaConfig.ts';
import bcrypt from 'bcryptjs';
import { successResponse } from "../lib/response.ts";
import { CustomError } from "../lib/customError.ts";


const SALT = envConf.SALT;


function generateFastRandomString(length: number) {
    return Math.random().toString(36).substring(2, length + 2);
}

interface NewPostData {
    userId: String,
    content: String
}

export const seedRouter = Router();

seedRouter.post("/register/:userNumber", async (req: Request, res: Response) => {
    const userNumber = Number(req.params['userNumber']);
    let users = [];
    for (let i = 1; i <= userNumber; i++) {
        const newUserData = {
            firstName: generateFastRandomString(5),
            lastName: generateFastRandomString(5),
            username: generateFastRandomString(8),
            passwordHash: await bcrypt.hash("Test@123", SALT),
            bio: generateFastRandomString(8)
        }

        const newUser = await prisma.user.create({
            data: newUserData
        })
        users.push(newUser)
    }
    return successResponse(res, 200, { users })
})

// seedRouter.post("/post/:postNumber", async (req: Request, res: Response, next: NextFunction) => {
//     const postNumber = Number(req.params['postNumber'])
//     const userIds = await prisma.user.findMany({
//         select: { id: true }
//     })
//     if (!userIds) return next(new CustomError("Unable to seed", 400))
//     const posts = [];
//     for (let i = 1; i <= postNumber; i++) {
//         let randomArrayIndex = Math.floor(Math.random() * userIds.length);
//         const newPostData: NewPostData = {
//             userId: userIds[randomArrayIndex].id,
//             content: generateFastRandomString(40)
//         }
//         const newPost = await prisma.post.create({
//             data: newPostData
//         })
//         posts.push(newPost)
//     }
//     return successResponse(res, 200, posts)
// })