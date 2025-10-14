import { Router } from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);

export default mainRouter;
