const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated" });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_JWT);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403, "You are not authorized!");
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403, "You are not authorized!");
    }
  });
};

module.exports = { verifyToken, verifyUser, verifyAdmin };
