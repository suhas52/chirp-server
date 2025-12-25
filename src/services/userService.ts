import { profanity } from '@2toad/profanity';
import { prisma } from "../config/prismaConfig.ts";
import { CustomError } from "../lib/customError.ts";
import { decodeCursor } from "../lib/encodeCursor.ts";
import type z from 'zod';
import type { postSchema } from '../zodSchemas/userSchemas.ts';
import { getSignedImageUrl, uploadToCloud } from '../lib/cloudInteraction.ts';
import processImage from '../lib/processImage.ts';


export const postPost = async (id: string, formData: z.infer<typeof postSchema>, file: Express.Multer.File | undefined) => {
    if (profanity.exists(formData.content)) throw new CustomError("Profanity is not allowed", 400)
    const processedImageBuffer = file ? await processImage(file) : null
    const imgFileName = processedImageBuffer ? await uploadToCloud(processedImageBuffer, "content") : null
    const newPost = await prisma.post.create({
        data: {
            userId: id, ...formData, imgFileName
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            imgFileName: true,
        }
    })
    return newPost;
}

export const getAllPosts = async (take: number, cursor?: string, userId?: string) => {

    const posts = await prisma.post.findMany({
        take: take + 1,
        orderBy: { cursorId: 'desc' },
        ...(cursor && {
            cursor: { cursorId: decodeCursor(cursor) },
            skip: 1,
        }),
        select: {
            id: true,
            content: true,
            updatedAt: true,
            userId: true,
            imgFileName: true,
            cursorId: true,
            _count: {
                select: { likes: true, retweets: true }
            },
            ...(userId && {
                likes: {
                    where: { userId },
                    select: { id: true }
                },
                retweets: {
                    where: { userId },
                    select: { id: true }
                }
            }),
            user: {
                select: {
                    avatarFileName: true,
                    username: true,
                    id: true
                }
            }
        }
    });


    let nextCursor = null;
    if (posts.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem && nextItem.cursorId;
    }

    const postsWithSignedUrl = await Promise.all(
        posts.map(async (post) => {
            const avatarUrl = await getSignedImageUrl(post.user.avatarFileName, "avatar")
            const postImageUrl = post.imgFileName ? await getSignedImageUrl(post.imgFileName, "content") : null
            return { ...post, avatarUrl, postImageUrl }
        })
    )

    return { posts: postsWithSignedUrl, nextCursor }
}

export const getPostByPostId = async (postId: string, userId?: string) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        },
        select: {
            id: true, content: true, updatedAt: true, userId: true, cursorId: true, imgFileName: true,
            _count: {
                select: { likes: true, retweets: true, }
            },
            ...(userId && {
                likes: {
                    where: { userId },
                    select: { id: true }
                },
                retweets: {
                    where: { userId },
                    select: { id: true }
                }
            }),
            user: {
                select: {
                    avatarFileName: true,
                    username: true,
                    id: true
                }
            }
        },
    })
    if (!post) throw new CustomError("Post does not exist", 400)
    const avatarUrl = await getSignedImageUrl(post.user.avatarFileName, "avatar")
    const postImageUrl = post.imgFileName ? await getSignedImageUrl(post.imgFileName, "content") : null
    return { ...post, avatarUrl, postImageUrl }
}

export const getPostsByUserId = async (userId: string, take: number, cursor?: string) => {

    const posts = await prisma.post.findMany({
        orderBy: { cursorId: 'asc' },
        take: take + 1,
        select: {
            id: true, content: true, updatedAt: true, userId: true, cursorId: true, imgFileName: true, user: {
                select: { username: true }
            }, likes: {
                where: { userId },
                select: { id: true }
            },
            retweets: {
                where: { userId },
                select: { id: true }
            },
            _count: {
                select: { likes: true, retweets: true }
            },
        },
        where: { userId: userId },
        ...(cursor && {
            cursor: { cursorId: decodeCursor(cursor) }
        })

    })

    if (posts.length === 0) throw new CustomError("This user either does not exist or does not have any posts", 400)
    let nextCursor = null;
    if (posts?.length > take) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.cursorId
    }

    console.log({ posts, nextCursor })
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

    const comments = await prisma.comment.findMany({
        orderBy: { cursorId: 'desc' },
        take: take + 1,

        where: { postId: postId },
        ...(cursor && {
            skip: 1,
            cursor: { cursorId: decodeCursor(cursor) }
        }),
        select: {
            content: true, createdAt: true, cursorId: true, id: true,
            user: {
                select: {
                    avatarFileName: true,
                    username: true,
                    id: true
                }
            }
        }
    })
    let nextCursor = null;
    if (comments.length > take) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.cursorId;
    }


    const comemntsWithSignedUrl = await Promise.all(
        comments.map(async (comment) => {
            const avatarUrl = await getSignedImageUrl(comment.user.avatarFileName, "avatar")
            return { ...comment, avatarUrl }
        })
    )

    return { comments: comemntsWithSignedUrl, nextCursor }
}

export const likePost = async (userId: string, postId: string) => {
    const newLike = await prisma.like.create({
        data: { userId, postId }
    })
    return newLike;
}

export const unlikePost = async (userId: string, likeId: string) => {

    const unliked = await prisma.like.deleteMany({
        where: { id: likeId, userId }
    })

    if (unliked.count === 0) throw new CustomError("like did not exist or did not belong to the user", 400)
    return unliked;
}

export const retweetPost = async (userId: string, postId: string) => {
    const retweet = await prisma.retweet.create({
        data: { userId, postId }
    })
    return retweet;
}

export const unRetweetPost = async (userId: string, retweetId: string) => {

    const unRetweeted = await prisma.retweet.deleteMany({
        where: { id: retweetId, userId }
    });
    if (unRetweeted.count === 0) throw new CustomError("retweet did not exist or did not belong to the user", 400)
    return unRetweeted
}

export const deletePost = async (userId: string, postId: string) => {
    const deletedPost = await prisma.post.deleteMany({
        where: { id: postId, userId }
    })
    if (deletedPost.count === 0) throw new CustomError("Post did not exist or did not belong to the user", 400)
    return deletedPost
}

export const followUser = async (followerId: string, followingId: string) => {
    const newFollow = await prisma.follow.create({
        data: { followerId, followingId }
    })

    return newFollow
}

export const unFollowUser = async (followerId: string, followingId: string) => {
    const unFollow = await prisma.follow.deleteMany({
        where: { followerId, followingId }
    })
    if (unFollow.count === 0) throw new CustomError("Not followed", 400)
    return unFollow
}

export const listFollowers = async (userId: string) => {
    const followers = await prisma.follow.findMany({
        where: { followingId: userId }
    })
    return followers
}

export const listFollowing = async (userId: string) => {
    const following = await prisma.follow.findMany({
        where: { followerId: userId }
    })
    return following
}