const followUserRouter = require("express").Router();
const followUserController = require("../../controllers/UserController/followUserController");
// const { verifyUser } = require("../../utils/Verifytoken");

followUserRouter.put("/:id/follow", followUserController);

module.exports = followUserRouter;