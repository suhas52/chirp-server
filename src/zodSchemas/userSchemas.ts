import * as zod from "zod";

const postField = zod.string().min(3, "Your content should atleast 3 letters long").max(255, "Your post cannot be more than 255 letters long")

export const postSchema = zod.object({
    content: postField
})