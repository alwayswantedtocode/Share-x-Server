const postRouters = require("express").Router();
const {
  createPost,
  updatePosts,
  getPosts,
  timelinePosts,
  profilePosts,
  likedislikePost,
  deletePost,
} = require("../../controllers/PostController/postControllers");



postRouters.post("/", createPost);
postRouters.put("/:id", updatePosts);
postRouters.get("/timeline/:userId", timelinePosts);
postRouters.get("/:id", getPosts);
postRouters.get("/profile/:username", profilePosts);
postRouters.put("/:id/like", likedislikePost);
postRouters.delete("/:id", deletePost);

module.exports = postRouters;