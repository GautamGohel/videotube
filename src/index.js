import dotenv from "dotenv";
import DB_connect from "./db/index.js";
import {app} from "./app.js";
dotenv.config({
  path: "./env",
});
DB_connect()
  .then(() => {
    app.listen(process.env.PORT||4000,()=>{
      console.log(`server is running at port ${process.env.PORT}`)
    });
  })
  .catch((err) => {
    console.log("MongoDB connection Error", err);
  });
