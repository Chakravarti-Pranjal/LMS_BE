import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from "../controllers/authController.js";
import upload from "../middlewares/multer.Middleware.js";
import { isLoggedIn } from "../middlewares/auth.Middleware.js";

const authRouter = Router();

authRouter.post("/register", upload.single("avatar"), register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:resetToken", resetPassword);
authRouter.post("/change-password", isLoggedIn, changePassword);

export default authRouter;
