
import { Router } from "express";
import { postSchema } from "../zodSchemas/userSchemas.ts";
import { validateInput } from "../middleware/validateInputMiddleware.ts";
import * as controller from "../controllers/userController.ts";
import { validateJwt } from "../middleware/jwtMiddleware.ts";

export const userRouter = Router();

userRouter.post("/post", validateInput(postSchema), validateJwt(), controller.postPost)
userRouter.get("/posts", controller.getAllPosts)
userRouter.get("/post/:postId", controller.getPostByPostId)
userRouter.get("/posts/:userId", controller.getPostsByUserId)
userRouter.post("/comment/:postId", validateJwt(), controller.postCommentByPostId)
userRouter.get("/comments/:postId", controller.getCommentsByPostId)

