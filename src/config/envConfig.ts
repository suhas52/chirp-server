import "dotenv/config";
import { envSchema } from "../zodSchemas/envSchemas.ts";


const inputValidation = envSchema.safeParse(process.env);
if (!inputValidation.success) throw new Error(inputValidation.error.message)

const envConf = inputValidation.data;
export default envConf;