const commentRouter = require("express").Router();
const {
  comment,
  getAllComments,
  likedislikeComments,
  updateComments,
  deleteComment,
} = require("../../controllers/commentController/commentController");

commentRouter.post("/:postId/comment", comment);
commentRouter.get("/:postId", getAllComments);
commentRouter.put("/:id/update", updateComments);
commentRouter.put("/:id/like", likedislikeComments);
commentRouter.delete("/:id", deleteComment);


module.exports = commentRouter;