const jwt = require("jsonwebtoken");
const userinfoConstants = require("../Constants/Userinfo/Userinfoconstants");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =req.headers["token"];

  if (!token) {
    return res.status(403).send({
        error:userinfoConstants.UNAUTHORIZED
    });
  }
  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

    req.user = decoded;
  } catch (err) {
    return res.status(401).send({
        error:userinfoConstants.UNAUTHORIZED
    });
  }
  return next();
};

module.exports = verifyToken;