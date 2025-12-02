
import express from 'express'

import { configDotenv } from 'dotenv';
import { authRouter } from './routes/authRoutes.ts';
import cookieParser from 'cookie-parser'

configDotenv();
const PORT = process.env.SERVER_PORT || 3000;

const app = express();
app.use(express.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)


app.listen(PORT, () => {
    console.log("Server started on port: ", PORT)
})