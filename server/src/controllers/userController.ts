import type { Request, Response, NextFunction } from 'express'
import { CustomError } from '../lib/customError.ts';
import { successResponse } from '../lib/response.ts';
import * as jwtService from '../services/jwtService.ts'
import * as userService from '../services/userService.ts'


export const postPostController = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    const accessToken = req.cookies.token;
    const decodedUser = jwtService.validateJwt(accessToken);
    if (!accessToken) throw next(new CustomError("User not logged in", 401))
    if (!formData) throw next(new CustomError("Invalid input", 400))
    const newPost = await userService.postPostService(decodedUser.id, formData)
    return successResponse(res, 201, newPost);
}

export const getAllPostsController = async (req: Request, res: Response, next: NextFunction) => {
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const postsData = await userService.getAllPostsService(take, cursor);
    return successResponse(res, 200, postsData)
}


export const getPostByPostIdController = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) return next(new CustomError("Invalid input", 400))
    const post = await userService.getPostByPostIdService(postId)
    return successResponse(res, 200, post)
}

export const getPostsByUserIdController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    if (!userId) return next(new CustomError("Invalid request", 400))
    const posts = await userService.getPostsByUserIdService(userId, take, cursor)
    return successResponse(res, 200, posts)
}

export const postCommentByPostIdController = async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body;
    const { postId } = req.params;
    const accessToken = req.cookies.token;
    if (!postId) return next(new CustomError("Invalid Request", 400))
    if (!accessToken) return next(new CustomError("You cannot comment without being logged in", 400));
    if (!formData) return next(new CustomError("Unable to post an empty form", 400))
    const decodedUser = jwtService.validateJwt(accessToken);
    const newComment = await userService.postCommentByPostIdService(decodedUser.id, postId, formData)
    return successResponse(res, 201, newComment)
}

export const getCommentsByPostIdController = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!postId) return next(new CustomError("Invalid request", 400))
    const comments = userService.getCommentsByPostIdService(postId, take, cursor)
    return successResponse(res, 200, comments)
}