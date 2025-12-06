
import { Router, type Request, type Response } from "express";
import jwt from 'jsonwebtoken';
import { failureResponse, successResponse } from "../lib/response.ts";
import { profanity, CensorType } from '@2toad/profanity';
import { postSchema } from "../zodSchemas/crudSchemas.ts";
import { prisma } from "../lib/prismaConfig.ts";


interface DecodedUser {
    id: string;
    username: string;
    iat: number;
    exp: number;
}

export const userRouter = Router();

userRouter.post("/post", async (req: Request, res: Response) => {
    const formData = req.body;
    const accessToken = req.cookies.token;
    try {
        if (!accessToken) throw new Error("User is not logged in")
        if (!formData) throw new Error("Invalid data")
        if (profanity.exists(formData.content)) throw new Error("Profanity is not allowed")
        const inputValidation = postSchema.safeParse(formData)
        if (!inputValidation.success) throw new Error("Invalid input")
        const decodedUser = jwt.decode(accessToken) as DecodedUser;
        const newPost = await prisma.post.create({
            data: {
                userId: decodedUser.id, ...formData
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                userId: true
            }
        })
        return successResponse(res, 201, newPost);
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occurred")
    }
})

userRouter.get("/posts", async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({

        })
        return successResponse(res, 200, posts)
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occurred")
    }
})

userRouter.get("/post/:postId", async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
        if (!postId) throw new Error("Invalid request")
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })
        return successResponse(res, 200, post)
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occured")
    }
})



userRouter.get("/posts/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        if (!userId) throw new Error("Invalid Request")
        const posts = await prisma.post.findMany({
            where: {
                userId: userId
            }
        })
        return successResponse(res, 200, posts)
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occurred")
    }
})

userRouter.post("/comment/:postId", async (req: Request, res: Response) => {
    const formData = req.body;
    const { postId } = req.params;
    const accessToken = req.cookies.token;
    try {

        if (!postId) throw new Error("Invalid Request")
        if (!accessToken) throw new Error("You cannot comment without being logged in");
        if (!formData) throw new Error("Unable to post an empty form")
        if (profanity.exists(formData.content)) throw new Error("Profanity is not allowed")
        const decodedUser = jwt.decode(accessToken) as DecodedUser;
        const newComment = await prisma.comment.create({
            data: {
                userId: decodedUser.id,
                postId: postId,
                content: formData.content
            }
        })
        return successResponse(res, 201, newComment)
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occurred")
    }
})

userRouter.get("/comments/:postId", async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
        if (!postId) throw new Error("Invalid request")
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId
            },
        })
        return successResponse(res, 200, comments)
    } catch (err) {
        if (err instanceof Error) {
            return failureResponse(res, 400, err.message)
        }
        return failureResponse(res, 400, "An unknown error occurred")
    }
})

