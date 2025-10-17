import Course from "../models/courseModel.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");

    if (!courses) {
      return next(new AppError("Courses not found", 400));
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "All Courses fetched succefully!",
      data: courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found!", 500));
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Course lectures fetched successfully!",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
      return next(new AppError("All fields are required", 400));
    }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    });

    if (!course) {
      return next(new AppError("Course not created, try again", 400));
    }

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    }

    await course.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Course created successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true, new: true }
    );

    if (!course) {
      return next(new AppError("Course no found", 400));
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Course updated successfully!",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Course deleted successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const addLectureToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
      return next(new AppError("All fields are required", 400));
    }

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    const lectureData = {
      title,
      description,
      lecture: {},
    };

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    }

    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Lecture added successfully!",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const deleteLectureFromCourseById = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;

    // 1️⃣ Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // 2️⃣ Find the lecture inside the course
    const lecture = course.lectures.id(lectureId);
    if (!lecture) {
      return next(new AppError("Lecture not found", 404));
    }

    // 3️⃣ Delete lecture video from Cloudinary (optional but good practice)
    if (lecture.lecture && lecture.lecture.public_id) {
      await cloudinary.v2.uploader.destroy(lecture.lecture.public_id);
    }

    // 4️⃣ Remove lecture from array
    course.lectures = course.lectures.filter(
      (lec) => lec._id.toString() !== lectureId.toString()
    );

    // 5️⃣ Update lecture count
    course.numberOfLectures = course.lectures.length;

    // 6️⃣ Save updated course
    await course.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Lecture deleted successfully!",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  addLectureToCourseById,
  deleteLectureFromCourseById,
};
