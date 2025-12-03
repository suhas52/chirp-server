
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/authRoutes.ts';
import { userRouter } from './routes/crudRoutes.ts';
import cookieParser from 'cookie-parser'
import envConf from './lib/envConfig.ts'


const PORT = envConf.SERVER_PORT;



const app = express();
app.use(express.urlencoded())
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

app.listen(PORT, () => {
    console.log("Server started on port: ", PORT)
})