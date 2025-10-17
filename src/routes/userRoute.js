import { Router } from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/auth.Middleware.js";
import upload from "../middlewares/multer.Middleware.js";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/", isLoggedIn, getUserById);
userRouter.put("/", isLoggedIn, upload.single("avatar"), updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
