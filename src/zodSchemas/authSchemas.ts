import * as zod from "zod";




const nameField = zod.string().min(3, "First Name must be atleast 3 letters").max(10, "First Name must be 10 letters max")
const usernameField = zod.string().min(4, "Username must be atleast 4 letters").max(15, "Username cannot be over 15 letters")

const password = zod.string().min(8).max(64).refine(p => {
  return (
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}, "Password does not meet complexity requirements");

export const registerSchema = zod.object({
  firstName: nameField,
  lastName: nameField,
  username: usernameField,
  password: password,
});

export const loginSchema = zod.object({
  username: usernameField,
  password: zod.string().min(3).max(10)
})

export const profileSchema = zod.object({
  firstName: nameField,
  lastName: nameField,
}).refine(
  (data) => data.firstName !== undefined || data.lastName !== undefined,
  {
    message: "At least one of First Name or Last Name must be provided",
  }
);