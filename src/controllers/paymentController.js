import { razorpay } from "../../app.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto-js";

const gerRazorpayApiKey = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      status: 200,
      message: "Razorpay API Key",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 400));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin not allow to purchase", 400));
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Subscribed Successfully!",
      data: subscription.id,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const verifySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_signature ||
      !razorpay_subscription_id
    ) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 400));
    }

    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
      .createHash("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionId}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Payment not verified, try again", 500));
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Payment verified successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const unSubscribe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 400));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin not allow to purchase", 400));
    }

    const subscriptionId = user.subscription.id;

    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Subscription cancled successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const payments = await Payment.find().skip(skip).limit(limit);

    const subscriptions = await razorpay.subscriptions.all({
      count: limit || 10,
    });

    const totalPayments = await Payment.countDocuments();

    if (!payments || payments.length === 0) {
      return next(new AppError("Payments not found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Payments fetched successfully!",
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
      totalPayments,
      results: payments.length,
      subscriptions,
      data: payments,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export {
  gerRazorpayApiKey,
  buySubscription,
  verifySubscription,
  unSubscribe,
  getAllPayments,
};
