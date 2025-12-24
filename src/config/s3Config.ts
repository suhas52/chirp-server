import { S3Client } from "@aws-sdk/client-s3";
import envConf from "./envConfig.ts";


const bucketRegion = envConf.BUCKET_REGION;
const accessKey = envConf.ACCESS_KEY;
const secretAccessKey = envConf.SECRET_ACCESS_KEY;


export const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion,
})