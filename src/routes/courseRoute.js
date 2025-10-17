import { Router } from "express";
import {
  addLectureToCourseById,
  createCourse,
  deleteCourse,
  deleteLectureFromCourseById,
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
} from "../controllers/courseController.js";
import {
  authorisedRoles,
  authorisedSubscriber,
  isLoggedIn,
} from "../middlewares/auth.Middleware.js";
import upload from "../middlewares/multer.Middleware.js";

const courseRouter = Router();

courseRouter.get("/", getAllCourses);
courseRouter.get(
  "/:id",
  isLoggedIn,
  authorisedSubscriber,
  getLecturesByCourseId
);
courseRouter.post(
  "/",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  upload.single("thumbnail"),
  createCourse
);
courseRouter.post(
  "/:id",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  upload.single("thumbnail"),
  addLectureToCourseById
);
courseRouter.put(
  "/:id",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  upload.single("thumbnail"),
  updateCourse
);
courseRouter.delete("/:id", isLoggedIn, authorisedRoles("ADMIN"), deleteCourse);

courseRouter.delete(
  "/:courseId/lecture/:lectureId",
  isLoggedIn,
  authorisedRoles("ADMIN"),
  deleteLectureFromCourseById
);

export default courseRouter;
