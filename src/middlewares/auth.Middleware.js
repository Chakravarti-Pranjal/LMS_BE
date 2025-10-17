import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";
import { config } from "dotenv";

config();

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthenticated, please login again", 400));
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = userDetails;

  next();
};

const authorisedRoles =
  (...roles) =>
  async (req, res, next) => {
    try {
      const currentUserRole = req.user.role;

      if (!roles.includes(currentUserRole)) {
        return next(
          new AppError(
            "You do not have permission to access this resource",
            403
          )
        );
      }

      next();
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

export { isLoggedIn, authorisedRoles };
