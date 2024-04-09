const Post = require("../../Models/PostSchema");
// const User = require("../Models/UsersSchema");

const likeController = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.Likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { Likes: req.body.userId } });
      res.status(200).json("Post has been liked");
    } else {
      await post.updateOne({ $pull: { Likes: req.body.userId } });
      res.status(200).json("Post has been unliked");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = likeController;
