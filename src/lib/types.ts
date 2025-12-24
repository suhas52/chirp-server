
import * as zod from "zod"
import type { loginSchema, profileSchema, registerSchema } from "../zodSchemas/authSchemas.ts"

export type registerData = zod.infer<typeof registerSchema>

export type loginData = zod.infer<typeof loginSchema>

export type profileFormData = zod.infer<typeof profileSchema>

export interface DecodedUser {
    id: string;
    username: string;
    iat: number;
    exp: number;
}