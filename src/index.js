import dotenv from "dotenv";
import DB_connect from "./db/index.js";
dotenv.config({
  path:'/.env'
})
DB_connect();
