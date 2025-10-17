import User from "../models/userModel.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import { config } from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import CryptoJS from "crypto-js";

config();

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return next(new AppError("Email already exists", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url:
          "https://www.sportico.com/wp-content/uploads/2020/09/0911_IMG.jpg",
      },
    });

    if (!user) {
      return next(
        new AppError("User registeration failed, please try again", 400)
      );
    }

    // File upload

    console.log("File =>", JSON.stringify(req.file));

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          // Remove file from uploads
          if (req.file.filename) {
            await fs.rm(`uploads/${req.file.filename}`);
          }
        }
      } catch (error) {
        return next(new AppError("File not uploaded, please try again", 500));
      }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully",
      token,
      data: user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if ((!email, !password)) {
      return next(new AppError("All fields are required", 400));
    }
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("Email or Password does not match", 400));
    }

    const token = await user.generateJWTToken();

    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      stauts: 200,
      message: "User LoggedIn successfully!",
      token,
      data: user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res, next) => {
  try {
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "User logged out successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Email not registered", 400));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = "Reset Password";
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset Password</a>\n If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}`;

    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      status: 200,
      message: `Reset password token has been sent to ${email} successfully!`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    return next(new AppError(error.message, 500));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = CryptoJS.createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpirary: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token is invalid or expired, please try again", 400)
      );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpirary = undefined;

    user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Password changes successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      return next(new AppError("User does not exist", 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return next(new AppError("Invalid old password", 400));
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
