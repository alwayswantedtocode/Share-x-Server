const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");
const postController = async (req, res) => {
  try {
    const { userId, Description, Image } = req.body;
    //repeated post
    const existingPost = await Post.findOne({
      userId,
      Description,
    });
    if (existingPost) {
      return res.status(409).json({ message: "You said this already!" });
    }
    //create a new post

    const newPost = new Post({
      userId,
      Description,
      Image,
    });

    //save the new post
    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = postController;
