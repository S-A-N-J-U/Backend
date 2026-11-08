import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))


app.use(express.json({ limit: "16kb" }))
// Jab frontend se server par koi data (jaise form data ya JSON body) 
// POST ya PUT request ke zariye bheja jata hai, toh wo raw stream text 
// ki tarah aata hai. express.json() us incoming raw text ko read karta hai,
// parse karta hai, aur ek readable JavaScript Object mein badal kar req.body 
// mein daal deta hai taaki aapka server code us data ko aasaani se use kar sake.

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import

import userRouter from './routes/user.routes.js'

// routes declaration

app.use("/api/v1/users", userRouter)   //https://localhost:8000/api/v1/users/register

export { app }