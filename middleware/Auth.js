const jwt = require("jsonwebtoken");
const userinfoConstants = require("../Constants/Userinfo/Userinfoconstants");
const ApiError = require("./Apierrors");
const Userinfo = require("../Modals/user.modal");

const config = process.env;

const verifyToken = async (req, res, next) => {
  const token =req.headers["token"];

  try {
    if (!token) {
      throw new ApiError(403, userinfoConstants.UNAUTHORIZED)
    }

    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const result = await Userinfo.findById(req.user.userid)
    if(!result){
      throw  next(new ApiError(403, userinfoConstants.UNAUTHORIZED))

    }

  } catch (err) {
    next(new ApiError(403, userinfoConstants.UNAUTHORIZED))
  }
  return next();
};

module.exports = verifyToken;