
import { Router, type NextFunction, type Request, type Response } from "express";
import { postSchema } from "../zodSchemas/userSchemas.ts";
import { validateInput } from "../middleware/validateInputMiddleware.ts";
import { getAllPostsController, getCommentsByPostIdController, getPostByPostIdController, getPostsByUserIdController, postCommentByPostIdController, postPostController } from "../controllers/userController.ts";

export const userRouter = Router();

userRouter.post("/post", validateInput(postSchema), postPostController)

userRouter.get("/posts", getAllPostsController)

userRouter.get("/post/:postId", getPostByPostIdController)

userRouter.get("/posts/:userId", getPostsByUserIdController)

userRouter.post("/comment/:postId", postCommentByPostIdController)

userRouter.get("/comments/:postId", getCommentsByPostIdController)

