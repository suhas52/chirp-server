import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import envConf from "./envConfig.ts";
import crypto from "crypto";

const bucketName = envConf.BUCKET_NAME;
const bucketRegion = envConf.BUCKET_REGION;
const accessKey = envConf.ACCESS_KEY;
const secretAccessKey = envConf.SECRET_ACCESS_KEY;


const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion,
})

function generateRandomImageName(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex')
}

export async function uploadToCloud(processedImageBuffer: Buffer) {
    const imageName = `${generateRandomImageName()}.png`;
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: processedImageBuffer,
        ContentType: "image/png"
    };

    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    return imageName;
}

export async function getSignedImageUrl(imageName: string) {
    const getObjectParams = {
        Bucket: bucketName,
        Key: imageName,
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}