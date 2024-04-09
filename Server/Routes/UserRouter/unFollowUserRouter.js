const unFollowUserRouter = require("express").Router();
const unFollowUserController = require("../../controllers/UserController/unfollowUserController");
// const { verifyUser } = require("../../utils/Verifytoken");



unFollowUserRouter.put("/:id/unfollow", unFollowUserController);

module.exports = unFollowUserRouter;