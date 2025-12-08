import * as zod from "zod"; 

export const postSchema = zod.object({
    content: zod.string().min(3).max(255)
})