const Comment = require("../../Models/CommentSchema");
const Post = require("../../Models/PostSchema");

const comment = async (req, res) => {
  try {
    const { userId, postId, username, profilePicture, comments } = req.body;

    if (!userId || !postId || !username || !comments) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for if post exist
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Check if comment has been said before
    const existingComment = await Comment.findOne({
      userId,
      postId,
      username,
      comments,
    });
    if (existingComment) {
      return res.status(409).json({ message: "You said this already!" });
    }
    //create new comments
    const newcomments = new Comment({
      userId,
      postId,
      username,
      profilePicture,
      comments,
    });

    const savedComments = await newcomments.save();

    res.status(200).json(savedComments);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getAllComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId });

    res.status(200).json(comments);

    res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const likedislikeComments = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment.Likes.includes(req.body.userId)) {
      await comment.updateOne({ $push: { Likes: req.body.userId } });
      res.status(200).json("Comments has been liked");
    } else {
      await comment.updateOne({ $pull: { Likes: req.body.userId } });
      res.status(200).json("Comments has been unliked");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

const updateComments = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await comment.updateOne({ $set: req.body });
      res.status(200).json("The comment has been updated");
    } else {
      res.status(403).json("you can only update your comment");
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await comment.deleteOne();
      res.status(200).json("The comment has been deleted");
    } else {
      res.status(403).json("you can only delete your comment");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  comment,
  getAllComments,
  likedislikeComments,
  updateComments,
  deleteComment,
};
