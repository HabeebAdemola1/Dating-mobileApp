import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"

dotenv.config()
const app = express()


const port = process.env.PORT || 1010



app.listen(() => {
    console.log(`server is runing on port ${port}`)
})