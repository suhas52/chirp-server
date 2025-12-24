import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import envConf from "../config/envConfig.ts";
import crypto from "crypto";
import { s3 } from '../config/s3Config.ts'

const bucketName = envConf.BUCKET_NAME;

function generateRandomImageName(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex')
}

export async function uploadToCloud(processedImageBuffer: Buffer, type: "avatar" | "content") {
    const imageName = `${generateRandomImageName()}.png`;
    const params = {
        Bucket: bucketName,
        Key: type === "avatar" ? `avatar-images/${imageName}` : `content-images/${imageName}`,
        Body: processedImageBuffer,
        ContentType: "image/png",
    };

    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    return imageName;
}

export async function getSignedImageUrl(imageName: string, type: "avatar" | "content") {
    const getObjectParams = {
        Bucket: bucketName,
        Key: type === "avatar" ? `avatar-images/${imageName}` : `content-images/${imageName}`,
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}