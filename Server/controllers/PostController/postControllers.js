const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");

const createPost = async (req, res) => {
  try {
    const { userId, Fullname, username, Description, Image, profilePicture } =
      req.body;
    //repeated post
    const existingPost = await Post.findOne({
      userId,
      username,
      Description,
    });
    if (existingPost) {
      return res.status(409).json({ message: "You said this already!" });
    }
    //create a new post
    const newPost = new Post({
      userId,
      profilePicture,
      Fullname,
      username,
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

const updatePosts = async (req, res) => {
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

const getPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const timelinePosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
};

const profilePosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};

const likedislikePost = async (req, res) => {
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

const deletePost = async (req, res) => {
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

module.exports = {
  createPost,
  updatePosts,
  getPosts,
  timelinePosts,
  profilePosts,
  likedislikePost,
  deletePost,
};
