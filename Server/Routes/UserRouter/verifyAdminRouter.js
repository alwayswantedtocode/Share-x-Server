const verifyAdminrRouter = require("express").Router();
const { verifyAdmin } = require("../../utils/Verifytoken");

verifyAdminrRouter.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
  res.send("You have full Authorization to all account");
});
module.exports = verifyAdminrRouter;
