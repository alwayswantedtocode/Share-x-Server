const verifyTokenrRouter = require("express").Router();
const  {verifyToken}  = require("../../utils/Verifytoken");

verifyTokenrRouter.get("/checkauthentication", verifyToken, (req, res, next) => {
  res.send("Hello you are logged in");
});
module.exports = verifyTokenrRouter;
