
import { Router } from "express";
import { postSchema } from "../zodSchemas/userSchemas.ts";
import { validateInput } from "../middleware/validateInputMiddleware.ts";
import * as controller from "../controllers/userController.ts";
import { validateJwt } from "../middleware/jwtMiddleware.ts";
import { multerUpload } from "../config/multerConfig.ts";

export const userRouter = Router();

userRouter.post("/post", multerUpload.single('post-image'), validateInput(postSchema), validateJwt(), controller.postPost)
userRouter.get("/posts", controller.getAllPosts)
userRouter.get("/post/:postId", controller.getPostByPostId)
userRouter.get("/posts/:userId", controller.getPostsByUserId)
userRouter.post("/comment/:postId", validateJwt(), validateInput(postSchema), controller.postCommentByPostId)
userRouter.get("/comments/:postId", controller.getCommentsByPostId)
userRouter.post("/post/like/:postId", validateJwt(), controller.likePost)
userRouter.delete("/post/like/:likeId", validateJwt(), controller.unlikePost)
userRouter.post("/post/retweet/:postId", validateJwt(), controller.retweetPost)
userRouter.delete("/post/retweet/:retweetId", validateJwt(), controller.unRetweetPost)
userRouter.delete("/post/:postId", validateJwt(), controller.deletePost)