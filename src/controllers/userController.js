import User from "../models/userModel.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";

const getUsers = (req, res) => {};

const getUserById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: "User fetched successfully!",
      data: user,
    });
  } catch (error) {
    return next(
      new AppError(error.message || "Failed to fetch user details", 500)
    );
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.user.id;

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("User does not exist", 400));
    }

    if (req.name) {
      user.name = name;
    }

    if (req.file) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

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

    res.status(200).json({
      success: true,
      status: 200,
      message: "User profile updated successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const deleteUser = (req, res) => {};

export { getUsers, getUserById, updateUser, deleteUser };
