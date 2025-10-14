import { Router } from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
