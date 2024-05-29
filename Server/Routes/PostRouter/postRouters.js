const postRouters = require("express").Router();
const {
  createPost,
  updatePosts,
  getPosts,
  timelinePosts,
  profilePosts,
  likedislikePost,
  deletePost,
  addComment,
  getAllComments,
  likedislikeComments,
} = require("../../controllers/PostController/postControllers");

postRouters.post("/", createPost);
postRouters.put("/:id", updatePosts);
postRouters.get("/timeline/:userId", timelinePosts);
postRouters.get("/:id", getPosts);
postRouters.get("/profile/:username", profilePosts);
postRouters.put("/:id/like", likedislikePost);
postRouters.delete("/:id", deletePost);
postRouters.post("/:postId/comments", addComment);
postRouters.get("/:postId/comments", getAllComments);
postRouters.put("/:postId/comments/:commentId/like", likedislikeComments);

module.exports = postRouters;
