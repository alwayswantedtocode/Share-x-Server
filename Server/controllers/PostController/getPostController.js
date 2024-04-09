const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");

const getPostController = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = getPostController;
