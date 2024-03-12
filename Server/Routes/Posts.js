const router = require("express").Router();
const Post = require("../Models/PostSchema");
const User = require("../Models/UsersSchema");
// const comment = required("../Models/CommentSchema");

// create a post

router.post("/", async (req, res) => {
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
});
//Update a post
router.put("/:id", async (req, res) => {
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
});
//delete a post
router.delete("/:id", async (req, res) => {
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
});
//Like and dislike a post
router.put("/:id/like", async (req, res) => {
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
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/timeline/:userId", async (req, res) => {
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
});

//get user's all posts

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
