import type { NextFunction } from "express"
import { profanity } from '@2toad/profanity';
import { prisma } from "../lib/prismaConfig.ts";
import { CustomError } from "../lib/customError.ts";

interface PostQuery {
    take: number,
    orderBy: { cursorId: 'asc' },
    skip?: number,
    cursor?: { cursorId: number },
    where?: { userId: string }
}

interface CommentQuery {

}

export const postPostService = async (id: string, formData: any, next: NextFunction) => {
    if (profanity.exists(formData.content)) throw next(new CustomError("Profanity is not allowed", 400))

    const newPost = await prisma.post.create({
        data: {
            userId: id, ...formData
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true
        }
    })
    return newPost;
}

export const getAllPostsService = async (take: number, next: NextFunction, cursor?: number) => {
    let query: PostQuery = {
        take: take + 1,
        orderBy: { cursorId: 'asc' },
    }

    if (cursor) {
        query.cursor = { cursorId: cursor }
    }

    const posts = await prisma.post.findMany(query)

    let nextCursor = null;

    if (posts.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.cursorId;
    }

    return { posts, nextCursor }
}

export const getPostByPostIdService = async (postId: string, next: NextFunction) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    })
    return post
}

export const getPostsByUserIdService = async (userId: string, next: NextFunction, take: number, cursor?: number) => {
    const query: PostQuery = {
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        where: { userId: userId }
    }

    if (cursor) {
        query.cursor = { cursorId: cursor }
    }


    const posts = await prisma.post.findMany(query)
    let nextCursor = null;
    if (posts.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.cursorId
    }

    return { posts, nextCursor }
}

export const postCommentByPostIdService = async (userId: string, postId: string, formData: any, next: NextFunction) => {
    if (profanity.exists(formData.content)) return next(new CustomError("Profanity is not allowed", 400))
    const newComment = await prisma.comment.create({
        data: {
            userId: userId,
            postId: postId,
            content: formData.content
        }
    })
    return newComment;
}

export const getCommentsByPostIdService = async (postId: string, next: NextFunction, take: number, cursor?: number) => {
    let query:  = {

    }
    const comments = await prisma.comment.findMany({
        where: {
            postId: postId
        },
    })

    return comments
}