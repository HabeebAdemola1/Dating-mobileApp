import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import morgan from "morgan"
import authRouter from "./routes/user/authRoute.js"
import { dbConnect } from "./db.js"

dbConnect()
dotenv.config()
const app = express()

app.use(bodyParser.json({limit: "10mb"}))
app.use(cors({ origin: "*" })); 
app.use(morgan("dev"))

app.use('/api/auth', authRouter)
const port = process.env.PORT 



app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
})