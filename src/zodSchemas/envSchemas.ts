import * as zod from 'zod';

const envSchema = zod.object({
    DATABASE_URL: zod.string().min(1),
    JWT_SECRET: zod.string().min(1),
    SALT: zod.coerce.number().int().positive(),
    SERVER_PORT: zod.coerce.number().int().positive(),
    BUCKET_NAME: zod.string().min(1),
    BUCKET_REGION: zod.string().min(1),
    ACCESS_KEY: zod.string().min(1),
    SECRET_ACCESS_KEY: zod.string().min(1),
    CLIENT_URL: zod.string().min(1)
})

export { envSchema }