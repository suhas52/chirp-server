import Router from "express";
import { loginController, logoutController, meController, profileController, registerController, updateAvatarController } from "../controllers/authController.ts";
import multer from "multer";
import { registerSchema, loginSchema, profileSchema } from "../zodSchemas/authSchemas.ts";
import { validateInput } from "../lib/validateInput.ts";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export const authRouter = Router();

authRouter.post("/register", validateInput(registerSchema), registerController)
authRouter.post("/login", validateInput(loginSchema), loginController)
authRouter.post("/logout", logoutController)
authRouter.get("/me", meController)
authRouter.patch("/profile", validateInput(profileSchema), profileController)
authRouter.patch("/update-avatar", upload.single('avatar'), updateAvatarController)