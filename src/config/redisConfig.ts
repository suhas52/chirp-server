import { createClient } from "redis";

const redisClient = createClient({url: "redis://redis:6379"})
redisClient.on("error", console.error);

await redisClient.connect();

export { redisClient }