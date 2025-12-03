import { Router, type Request, type Response } from "express";
import { prisma } from '../generated/prisma/prisma.ts';
import { failureResponse, successResponse } from "../lib/response.ts";
import { loginSchema, profileSchema, registerSchema } from "../zodSchemas/authSchemas.ts";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import envConf from "../lib/envConfig.ts";

        
const SALT = envConf.SALT;
const SECRET = envConf.JWT_SECRET;

interface DecodedUser {
    id: string;
    username: string;
    iat: number;
    exp: number;
}


export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
    const formData = req.body
    const inputValidation = registerSchema.safeParse(formData);
    if (!inputValidation.success) {
        return failureResponse(res, 400, "Failed to validate input")
    }
    const passwordHash = await bcrypt.hash(formData.password, SALT)
    try {
        const newUser = await prisma.user.create({
            data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                passwordHash: passwordHash
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                createdAt: true
            }
        })
        return successResponse(res, 201, newUser)
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return failureResponse(res, 400, err.message);
        }
        return failureResponse(res, 400, "An unknown error occurred");
    }
})

authRouter.post("/login", async (req: Request, res: Response) => {
    const formData = req.body;
    
    try {
        const inputValidation = loginSchema.safeParse(formData);
        if (!inputValidation.success) throw new Error("Failed to validate input")
            const user = await prisma.user.findUnique({
            where: {username: formData.username},
            select: {
                id: true,
                username: true,
                passwordHash: true,
                firstName: true,
                lastName: true
            },
        })
        if (!user) throw new Error("Invalid credentials")
            const passwordMatch = await bcrypt.compare(formData.password, user.passwordHash)
        if (!passwordMatch) throw new Error("Invalid credentials")
            const accessToken = jwt
        .sign({id: user.id, username: user.username}, SECRET, {
            expiresIn: 7 * 24 * 60 * 60,
            
        })
        
        res.status(200).cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).json({
            success: true,
            data: {id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName}
        })
        
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return failureResponse(res, 400, err.message);
        }
        return failureResponse(res, 400, "An unknown error occurred");
    }
})

authRouter.post("/logout", async (req: Request, res: Response) => {
    try {
        
        if (!req.cookies.token) throw new Error("User not logged in")
            successResponse(res.clearCookie("token"), 200)
        
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return failureResponse(res, 400, err.message);
        }
        return failureResponse(res, 400, "An unknown error occurred");
    }
})

authRouter.get("/me", async (req: Request, res: Response) => {
    if (!req.cookies.token) return failureResponse(res, 400, "User not logged in")
        const accessToken = req.cookies.token;
    try {
        const decodedUser = jwt.verify(accessToken, SECRET) as DecodedUser;
        return successResponse(res, 200, decodedUser)
    } catch (err) {
        return failureResponse(res, 400, "Invalid token")
    }
    
})

authRouter.patch("/profile", async (req: Request, res: Response) => {
    const formData = req.body;
    try {
        if (!req.cookies.token) throw new Error("User not logged in")
            const accessToken = req.cookies.token;
        if (!formData) throw new Error("Invalid input.")
            const inputValidation = profileSchema.safeParse(formData);
        if (!inputValidation.success) throw new Error("Invalid input")
            const decodedUser = jwt.verify(accessToken, SECRET) as DecodedUser;
        const modifiedUser = await prisma.user.update({
            where: {
                id: decodedUser.id
            },
            data: formData,
        })
        return successResponse(res, 204)
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
            return failureResponse(res, 400, err.message);
        }
        return failureResponse(res, 400, "An unknown error occurred");
    }
})