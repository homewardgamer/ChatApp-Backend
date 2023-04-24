const express = require("express");
const {
  registerUser,
  authUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);

module.exports = router;
