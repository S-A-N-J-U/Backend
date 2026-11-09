import dotenv from "dotenv";
import connectDB from "./db/index.js";
import dns from "dns"
import { app } from "./app.js";

/*
import express from "express"
const app = express()

;(async () => {
  try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error) => {
          console.log("ERROR",error)})      // db connected but express not connect
          throw error
          
          app.listen(process.env.PORT,() => {
            console.log("PORT")
            })    
    
    }catch(error){
        throw error
    }
    })()

    */


dns.setServers(["1.1.1.1", "8.8.8.8"])

dotenv.config({
    path: "./.env"
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })