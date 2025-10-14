import User from "../models/userModel.js";
import AppError from "../utils/error.util.js";

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

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

const login = (req, res) => {
  try {
  } catch (error) {}
};

const logout = (req, res) => {
  try {
  } catch (error) {}
};

export { register, login, logout };
