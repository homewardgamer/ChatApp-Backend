const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");

const protected = asyncHandler(async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // decode token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      return next(
        new ErrorResponse(`Authorization failed, reason: ${err.message}`, 401)
      );
    }
  }

  if (!token) {
    return next(
      new ErrorResponse("Unauthorized Access, token is missing", 401)
    );
  }
});

module.exports = { protected };
