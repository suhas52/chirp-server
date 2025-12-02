import { Router, type Request, type Response } from "express";
import { prisma } from '../generated/prisma/prisma.ts';
import { failureResponse, successResponse } from "../lib/response.ts";
import { loginSchema, registerSchema } from "../zodSchemas/authSchemas.ts";
export const authRouter = Router();
import bcrypt from 'bcryptjs';
import { configDotenv } from "dotenv";
import jwt from 'jsonwebtoken';
configDotenv();

if (!process.env.JWT_SECRET) throw new Error("Please ensure the JWT_SECRET exists in your environment")
if (!process.env.SALT) throw new Error("Please ensure SALT exists in your environment")

const SALT = Number(process.env.SALT);
const SECRET = String(process.env.JWT_SECRET);





authRouter.get("/test", (req: Request, res: Response) => {
    return failureResponse(res, 400, "Invalid entry")
})

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
    } catch (err: any) {
        return failureResponse(res, 409, err.message)
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
        
    } catch (err: any) {
        return failureResponse(res, 400, err.message)
    }
})

authRouter.post("/logout", async (req: Request, res: Response) => {
    try {
        
        if (!req.cookies.token) throw new Error("User not logged in")
        successResponse(res.clearCookie("token"), 200, {})
        
    } catch (err: any) {
        return failureResponse(res, 400, err.message);
    }
})

authRouter.get("/me", async (req: Request, res: Response) => {
    if (!req.cookies.token) return failureResponse(res, 400, "User not logged in")
    const accessToken = req.cookies.token;
    try {
        const decodedUser = jwt.verify(accessToken, SECRET);
        return successResponse(res, 200, decodedUser)
    } catch (err) {
        return failureResponse(res, 400, "Invalid token")
    }
    
})