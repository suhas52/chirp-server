import { Router, type NextFunction, type Request, type Response } from "express";
import { prisma } from '../lib/prismaConfig.ts';
import { successResponse } from "../lib/response.ts";
import { createPost, createRandomUser } from "../lib/seed.ts";
import { CustomError } from "../lib/customError.ts";


export const seedRouter = Router();

seedRouter.post("/register/:userNumber", async (req: Request, res: Response) => {
    const userNumber = Number(req.params['userNumber']);

    let users = [];
    for (let i = 1; i <= userNumber; i++) {
        const fakerData = createRandomUser();
        const newUser = await prisma.user.create({
            data: await fakerData
        })
        users.push(newUser)
    }
    return successResponse(res, 200, { users })
})

seedRouter.post("/posts/:postNumber", async (req: Request, res: Response, next: NextFunction) => {
    const postNumber = Number(req.params['postNumber'])
    const userIds = await prisma.user.findMany({
        select: { id: true }
    })
    if (userIds.length === 0) {
        return next(new CustomError("No users found", 400));
    }

    const posts = [];
    for (let i = 1; i <= postNumber; i++) {
        let randomArrayIndex = Math.floor(Math.random() * userIds.length);

        const newPost = await prisma.post.create({
            data: {
                userId: userIds[randomArrayIndex]!.id,
                content: createPost()
            }
        })
        posts.push(newPost)
    }
    return successResponse(res, 200, posts)
})

seedRouter.post("/comments/:commentNumber", async (req: Request, res: Response, next: NextFunction) => {
    const commentNumber = Number(req.params['commentNumber'])
    const postIds = await prisma.post.findMany({
        select: { id: true }
    })
    const userIds = await prisma.user.findMany({
        select: { id: true }
    })
    if (!postIds || !userIds) return next(new CustomError("Unable to seet", 400))
    const comments = [];
    for (let i = 1; i <= commentNumber; i++) {
        let randomPostArrayIndex = Math.floor(Math.random() * postIds.length)
        let randomUserArrayIndex = Math.floor(Math.random() * userIds.length);
        const newComment = await prisma.comment.create({
            data: {
                postId: postIds[randomPostArrayIndex]!.id,
                userId: userIds[randomUserArrayIndex]!.id,
                content: createPost()
            }
        })
        comments.push(newComment)
    }
    return successResponse(res, 200, comments)
})