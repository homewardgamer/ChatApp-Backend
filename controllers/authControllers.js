const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const { sendEmail } = require("../utils/sendMail");

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide all the fields." });
  }

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email Already Registered");
    }

    const user = await User.create({
      username,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        token: await user.generateToken(),
      });
    }
  } catch (error) {
    next(error);
  }
});

const authUser = asyncHandler(async (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return next(new ErrorResponse("Please provide credentials", 400));
  }

  try {
    let user = await User.findOne({ email: login }).select("+password");
    if (!user)
      user = await User.findOne({ username: login }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        token: await user.generateToken(),
      });
    } else return next(new ErrorResponse("Invalid credentials", 401));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorResponse("Email could not be sent", 404));

    const resetToken = await user.generateResetToken();
    await user.save();
    let LOCALHOST = `http://localhost:${process.env.PORT || "8000"}`;
    const resetURL = `${
      process.env.BASE_URL || LOCALHOST
    }/resetpassword/${resetToken}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a put request to the following link:</p>
      <a href=${resetURL} clicktracking=off>${resetURL}</a>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset password Request",
        text: message,
      });
      res.status(200).json({
        success: true,
        data: "Email sent",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return next(new ErrorResponse("Invalid reset Token", 400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, data: "Password reset Success" });
  } catch (error) {
    next(error);
  }
});

module.exports = { registerUser, authUser, resetPassword, forgotPassword };
