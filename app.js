import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectToDB from "./src/config/db.js";
import errorMiddleware from "./src/middlewares/error.Middleware.js";
import mainRouter from "./src/routes/mainRoutes.js";

config();

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credential: true,
  })
);

app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", mainRouter);

app.get("/", (req, res) => {
  res.status(404).send("Hello World");
});

// app.all("*", (req, res) => {
//   res.send("OOPs!! 404 page not found");
// });

app.use(errorMiddleware);

app.listen(PORT, async () => {
  await connectToDB();
  console.log(`server is running on ${PORT}`);
});
