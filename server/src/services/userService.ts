import type { NextFunction } from "express"
import { profanity } from '@2toad/profanity';
import { prisma } from "../lib/prismaConfig.ts";
import { CustomError } from "../lib/customError.ts";
import * as types from '../lib/types.ts'


export const postPostService = async (id: string, formData: any) => {
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

export const getAllPostsService = async (take: number, cursor?: number) => {
    let query: types.PostQuery = {
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

export const getPostByPostIdService = async (postId: string) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    })
    return post
}

export const getPostsByUserIdService = async (userId: string, take: number, cursor?: number) => {
    const query: types.PostQuery = {
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        where: { userId: userId }
    }

    if (cursor) {
        query.cursor = { cursorId: cursor }
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

export const postCommentByPostIdService = async (userId: string, postId: string, formData: any) => {
    if (profanity.exists(formData.content)) throw new CustomError("Profanity is not allowed", 400)
    const newComment = await prisma.comment.create({
        data: {
            userId: userId,
            postId: postId,
            content: formData.content
        }
    })
    return newComment;
}

export const getCommentsByPostIdService = async (postId: string, take: number, cursor?: number) => {
    let query: types.CommentQuery = {
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        where: { postId: postId }
    }

    if (cursor) {
        query.cursor = { cursorId: cursor }
    }

    const comments = await prisma.comment.findMany(query)
    let nextCursor = null;
    if (comments.length > take) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.id;
    }

    return { comments, nextCursor }
}