import { PrismaPg } from "@prisma/adapter-pg";
import envConf from "./envConfig";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = envConf.DATABASE_URL;

const adapter = new PrismaPg({
    connectionString: databaseUrl
})

export const prisma = new PrismaClient({ adapter })