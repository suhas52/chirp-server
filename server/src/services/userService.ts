import { profanity } from '@2toad/profanity';
import { prisma } from "../lib/prismaConfig.ts";
import { CustomError } from "../lib/customError.ts";
import * as types from '../lib/types.ts'
import { decodeCursor, encodeCursor } from "../lib/encodeCursor.ts";
import type z from 'zod';
import type { postSchema } from '../zodSchemas/userSchemas.ts';


export const postPost = async (id: string, formData: z.infer<typeof postSchema>) => {
    if (profanity.exists(formData.content)) throw new CustomError("Profanity is not allowed", 400)
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

export const getAllPosts = async (take: number, cursor?: string) => {
    let query: types.PostQuery = {
        take: take + 1,
        orderBy: { cursorId: 'asc' },
        select: {
            id: true, content: true, updatedAt: true, userId: true,
            _count: {
                select: { likes: true, retweets: true }
            }
        },
    }


    if (cursor) {
        const decodedCursor = decodeCursor(cursor)
        query.cursor = { cursorId: decodedCursor }
    }

    const posts = await prisma.post.findMany(query)
    let nextCursor = null;
    if (posts.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem && encodeCursor(nextItem.cursorId);
    }

    return { posts, nextCursor }


}

export const getPostByPostId = async (postId: string) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true, content: true, updatedAt: true, userId: true,
            _count: {
                select: { likes: true, retweets: true }
            }
        },
    })
    return post
}

export const getPostsByUserId = async (userId: string, take: number, cursor?: string) => {
    const query: types.PostQuery = {
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        where: { userId: userId },

    }

    if (cursor) {
        const decodedCursor = decodeCursor(cursor)
        query.cursor = { cursorId: decodedCursor }
    }


    const posts = await prisma.post.findMany(query)
    if (posts.length === 0) throw new CustomError("This user either does not exist or does not have any posts", 400)
    let nextCursor = null;
    if (posts.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.cursorId
    }

    return { posts, nextCursor }
}

export const postCommentByPostId = async (userId: string, postId: string, formData: z.infer<typeof postSchema>) => {
    const { content } = formData;
    if (profanity.exists(formData.content)) throw new CustomError("Profanity is not allowed", 400)
    const newComment = await prisma.comment.create({
        data: {
            userId,
            postId,
            content
        }
    })
    return newComment;
}

export const getCommentsByPostId = async (postId: string, take: number, cursor?: string) => {
    let query: types.CommentQuery = {
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        where: { postId: postId }
    }

    if (cursor) {
        const decodedCursor = decodeCursor(cursor)
        query.cursor = { cursorId: decodedCursor }
    }

    const comments = await prisma.comment.findMany(query)
    let nextCursor = null;
    if (comments.length > take) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.cursorId;
    }

    return { comments, nextCursor }
}

export const likePost = async (userId: string, postId: string) => {
    const newLike = await prisma.like.create({
        data: { userId, postId }
    })
    return newLike;
}

export const unlikePost = async (userId: string, likeId: string) => {
    const like = await prisma.like.findUnique({
        where: { id: likeId }
    })
    if (!like) throw new CustomError("You have not liked this post", 400)
    if (like.userId !== userId) throw new CustomError("You cannot unlike for others", 400)
    const unliked = await prisma.like.delete({
        where: { id: likeId }
    })
    return unliked;
}

export const retweetPost = async (userId: string, postId: string) => {
    const retweet = await prisma.retweet.create({
        data: { userId, postId }
    })
    return retweet;
}

export const unRetweetPost = async (userId: string, retweetId: string) => {
    const retweet = await prisma.retweet.findUnique({
        where: { id: retweetId }
    })
    if (!retweet) throw new CustomError("You have not retweeted this post", 400);
    if (retweet.userId !== userId) throw new CustomError("You cannot remove a retweet for others", 400)
    const unRetweeted = await prisma.retweet.delete({
        where: { id: retweetId }
    });
    return unRetweeted
}