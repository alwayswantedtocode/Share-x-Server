const AloowOrigins = require("../Config/AllowOrigins")

const Credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (AloowOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = Credentials;