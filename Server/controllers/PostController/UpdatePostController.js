const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");

const updatePostController = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("you can only update your post");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = updatePostController;
