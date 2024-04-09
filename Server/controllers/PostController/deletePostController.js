const Post = require("../../Models/PostSchema");
// const User = require("../Models/UsersSchema");

const deletePostController = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted");
    } else {
      res.status(403).json("you can only delete your post");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = deletePostController;