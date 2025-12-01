
import express from 'express'

import { configDotenv } from 'dotenv';
import { userRouter } from './routes/authRoutes.ts';

configDotenv();


const app = express();
app.use("/api", userRouter)


app.listen(3000, () => {
    console.log("Server started")
})