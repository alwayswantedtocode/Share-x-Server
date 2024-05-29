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

const addComment = async (req, res) => {
  try {
    const { userId, username, profilePicture, comments } = req.body;
    const { postId } = req.params;

    if (!userId || !username || !comments) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for if post exist
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Check if comment has been said before
    const existingComment = existingPost.Comments.find(
      (comment) => comment.userId === userId && comment.comments === comments
    );
    if (existingComment) {
      return res.status(409).json({ message: "You said this already!" });
    }

    existingPost.Comments.push({
      userId,
      username,
      profilePicture,
      comments,
    });

    const savedComments = await existingPost.save();
    console.log(savedComments);
    res.status(200).json(savedComments);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getAllComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).select("Comments");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.Comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    return res.status(500).json({ error: "Error getting comments" });
  }
};

const likedislikeComments = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.Comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!comment.Likes.includes(userId)) {
      comment.Likes.push(userId);
      await post.save();
      res.status(200).json("Comment has been liked");
    } else {
      comment.Likes = comment.Likes.filter((id) => id !== userId);
      await post.save();
      res.status(200).json("Comment has been unliked");
    }
  } catch (error) {
    console.error("Error liking/disliking comment:", error);
    return res.status(500).json({ error: "Error liking/disliking comment" });
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
  createPost,
  updatePosts,
  getPosts,
  timelinePosts,
  profilePosts,
  likedislikePost,
  deletePost,
  addComment,
  getAllComments,
  likedislikeComments,
};
