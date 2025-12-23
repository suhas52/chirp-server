import sharp from "sharp";
import { CustomError } from "./customError.ts";

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

export default async function processImage(image: Express.Multer.File) {
    if (!allowedFileTypes.includes(image.mimetype)) throw new CustomError("Invalid file type", 400)
    const processedImageBuffer = await sharp(image.buffer).resize(200).png().toBuffer();
    return processedImageBuffer;
}