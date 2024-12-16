import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(
  json({
    limit: "16kb",
  })
);

app.use(
  urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());

export default app;
