import type { Request, Response, NextFunction } from 'express'
import { CustomError } from '../lib/customError.ts';
import { successResponse } from '../lib/response.ts';
import * as userService from '../services/userService.ts'


export const postPost = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    const decodedUser = req.decodedUser;
    if (!formData) throw next(new CustomError("Invalid input", 400))
    const newPost = await userService.postPost(decodedUser.id, formData)
    return successResponse(res, 201, newPost);
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const postsData = await userService.getAllPosts(take, cursor);
    return successResponse(res, 200, postsData)
}


export const getPostByPostId = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) return next(new CustomError("Invalid input", 400))
    const post = await userService.getPostByPostId(postId)
    return successResponse(res, 200, post)
}

export const getPostsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    if (!userId) return next(new CustomError("Invalid request", 400))
    const posts = await userService.getPostsByUserId(userId, take, cursor)
    return successResponse(res, 200, posts)
}

export const postCommentByPostId = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    const { postId } = req.params;
    const decodedUser = req.decodedUser;
    if (!postId) return next(new CustomError("Invalid Request", 400))
    if (!formData) return next(new CustomError("Unable to post an empty form", 400))

    const newComment = await userService.postCommentByPostId(decodedUser.id, postId, formData)
    return successResponse(res, 201, newComment)
}

export const getCommentsByPostId = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    if (!postId) return next(new CustomError("Invalid request", 400))
    const comments = await userService.getCommentsByPostId(postId, take, cursor)
    return successResponse(res, 200, comments)
}

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) return next(new CustomError("Invalid request", 400))
    const decodedUser = req.decodedUser;
    const newLikePost = await userService.likePost(decodedUser.id, postId);
    return successResponse(res, 200, newLikePost)
}

export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
    const { likeId } = req.params;
    if (!likeId) return next(new CustomError("Invalid request", 400));
    const decodedUser = req.decodedUser;
    const unlikePost = await userService.unlikePost(decodedUser.id, likeId)
    return successResponse(res, 204)
}

export const retweetPost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) return next(new CustomError("Invalid request", 400));
    const decodedUser = req.decodedUser;
    const newRetweet = await userService.retweetPost(decodedUser.id, postId)
    return successResponse(res, 200, newRetweet)
}

export const unRetweetPost = async (req: Request, res: Response, next: NextFunction) => {
    const { retweetId } = req.params;
    if (!retweetId) return next(new CustomError("Invalid request", 400));
    const decodedUser = req.decodedUser;
    const unRetweetPost = await userService.unRetweetPost(decodedUser.id, retweetId)
    return successResponse(res, 204)
}