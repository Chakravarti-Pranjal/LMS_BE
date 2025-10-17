import { Router } from "express";
import {
  buySubscription,
  gerRazorpayApiKey,
  getAllPayments,
  unSubscribe,
  verifySubscription,
} from "../controllers/paymentController.js";
import { isLoggedIn } from "../middlewares/auth.Middleware.js";

const paymentRouter = Router();

paymentRouter.get("/razorpay-key", isLoggedIn, gerRazorpayApiKey);
paymentRouter.post("/subscribe", isLoggedIn, buySubscription);
paymentRouter.post("/verify", isLoggedIn, verifySubscription);
paymentRouter.post("/unsubscribe", isLoggedIn, unSubscribe);
paymentRouter.get("/", isLoggedIn, getAllPayments);

export default paymentRouter;
