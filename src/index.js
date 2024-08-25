require('dotenv').config()
const app = require('./app.js')

/*
import dotenv from "dotenv";
dotenv.config({
  path: "./env", // not neccessary
});
*/

const connectDB =  require("./db/index.js");

connectDB().then(()=>{
  app.listen(process.env.port,()=>{
    console.log(`Server is listening at ${process.env.port}`);
  }); 
}).catch((error)=>{
  console.log("MongoDB connection failed : ", error);
});

// console.log("ugghghjgjhg");
//
