
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/authRoutes.ts';
import { userRouter } from './routes/userRoutes.ts';
import cookieParser from 'cookie-parser'
import envConf from './lib/envConfig.ts'
import { seedRouter } from './routes/seedRoutes.ts';
import { globalErrorHandler } from './middleware/errorMiddleware.ts';
import { METHODS } from 'node:http';


const port = envConf.SERVER_PORT;
const clientUrl = envConf.CLIENT_URL;
const corsOptions = {
    origin: clientUrl,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}

const app = express();


app.use(express.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/seed", seedRouter)
app.use(globalErrorHandler)


app.listen(port, () => {
    console.log("Server started on port: ", port)
})