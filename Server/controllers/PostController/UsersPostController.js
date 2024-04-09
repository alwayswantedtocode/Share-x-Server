const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");

const userPostController = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = userPostController;
