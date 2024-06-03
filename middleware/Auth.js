const jwt = require("jsonwebtoken");
const userinfoConstants = require("../Constants/Userinfo/Userinfoconstants");
const ApiError = require("./Apierrors");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =req.headers["token"];

  try {
    if (!token) {
      throw new ApiError(403, userinfoConstants.UNAUTHORIZED)
    }

    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = decoded;

  } catch (err) {
    next(new ApiError(403, userinfoConstants.UNAUTHORIZED))
  }
  return next();
};

module.exports = verifyToken;