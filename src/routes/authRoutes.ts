import Router from "express";
import * as controller from "../controllers/authController.ts";
import multer from "multer";
import { registerSchema, loginSchema, profileSchema } from "../zodSchemas/authSchemas.ts";
import { validateInput } from "../middleware/validateInputMiddleware.ts";
import { validateJwt } from "../middleware/jwtMiddleware.ts";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export const authRouter = Router();

authRouter.post("/register", validateInput(registerSchema), controller.register)
authRouter.post("/login", validateInput(loginSchema), controller.login)
authRouter.post("/logout", controller.logout)
authRouter.get("/me", validateJwt(), controller.me)
authRouter.get("/user/:userId", controller.getUser)
authRouter.patch("/update-profile", validateInput(profileSchema), validateJwt(), controller.profile)
authRouter.patch("/update-avatar", upload.single('avatar'), validateJwt(), controller.updateAvatar)