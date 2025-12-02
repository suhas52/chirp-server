import * as zod from "zod"; 

export const registerSchema = zod.object({
    firstName: zod.string().min(3).max(10),
    lastName: zod.string().min(3).max(10),
    username: zod.string().min(4).max(15),
    password: zod.string().min(3).max(10),
});

export const loginSchema = zod.object({
    username: zod.string().min(4).max(15),
    password: zod.string().min(3).max(10)
})