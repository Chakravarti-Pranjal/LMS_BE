import { Router } from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js";
import { isLoggedIn } from "../middlewares/auth.Middleware.js";
import courseRouter from "./courseRoute.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", isLoggedIn, userRouter);
mainRouter.use("/courses", courseRouter);

export default mainRouter;
