import * as zod from "zod"; 

const password = zod.string().min(8).max(64).refine(p => {
  return (
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}, "Password does not meet complexity requirements");

export const registerSchema = zod.object({
    firstName: zod.string().min(3).max(10),
    lastName: zod.string().min(3).max(10),
    username: zod.string().min(4).max(15),
    password: password,
});

export const loginSchema = zod.object({
    username: zod.string().min(4).max(15),
    password: zod.string().min(3).max(10)
})