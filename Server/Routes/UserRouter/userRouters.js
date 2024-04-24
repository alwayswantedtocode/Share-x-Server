const userRouters = require("express").Router();
const {
  updateUser,
  searchForUsers,
  getUsersProfile,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowings,
} = require("../../controllers/UserController/userControllers");


userRouters.put("/:id", updateUser);
userRouters.get("/search", searchForUsers);
userRouters.get("/profile", getUsersProfile);
userRouters.delete("/:id", deleteUser);
userRouters.put("/:id/follow", followUser);
userRouters.put("/:id/unfollow", unfollowUser);
userRouters.get("/followers/:userId", getFollowers);
userRouters.get("/followings/:userId", getFollowings);

module.exports = userRouters;
