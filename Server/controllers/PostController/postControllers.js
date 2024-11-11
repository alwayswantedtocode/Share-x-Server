const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");
const mongoose = require("mongoose");

const createPost = async (req, res) => {
  try {
    const { userId, Fullname, username, Description, Image, profilePicture } =
      req.body;
    // Check for required fields
    if (!userId || !username ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Check if the post is a duplicate
    const existingPost = await Post.findOne({
      userId,
      username,
      Description,
    });
    if (existingPost) {
      return res.status(409).json({ message: "You said this already!" });
    }
    // Create a new post
    const newPost = new Post({
      userId,
      profilePicture,
      Fullname,
      username,
      Description,
      Image,
    });

    const savedPost = await newPost.save();
    res.status(200).json(savedPost);

    // Notify followers of new post
    const user = await User.findById(userId);
    const notificationMessage = `${Fullname} has posted a new update.`;
    await Promise.all(
      user.followers.map(async (followerId) => {
        await User.findByIdAndUpdate(followerId, {
          $push: {
            notifications: {
              type: "new_post",
              senderId: userId,
              postId: savedPost._id,
              senderImage:savedPost.profilePicture,
              message: notificationMessage,
            },
          },
        });
      })
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Error creating post" });
  }
};

const updatePosts = async (req, res) => {
  try {
    const { Fullname, username, Description, Image, profilePicture } = req.body;
    const userId = req.query.userId;

    // || req.params.userId
    if (!userId) {
      return res.status(400).json("User ID is required");
    }

    // Find the current user and the post
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json("User not found");
    }
    // const
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    const currentUserId = currentUser._id.toString();
    const postUserId = post.userId.toString();

    if (postUserId === currentUserId) {
      const updateData = {
        userId: currentUserId,
        profilePicture,
        Fullname,
        username,
        Description,
        Image,
      };

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      if (!updatedPost) {
        console.error("Post not updated");
        return res.status(500).json({ message: "Post update failed" });
      }

      res.status(200).json(updatedPost);
    } else {
      res.status(403).json("You can only update your post");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the post", error });
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
    const { userId } = req.body;
    const postId = req.params.id;

    // Convert userId and postId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const postObjectId = new mongoose.Types.ObjectId(postId);

    const post = await Post.findById(postObjectId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.Likes.includes(userObjectId)) {
      // Like the post
      await post.updateOne({ $push: { Likes: userObjectId } });
      res.status(200).json("Post has been liked");

      // Notify post owner of the like
      const currentUser = await User.findById(userObjectId);
      const notificationMessage = `${currentUser.Fullname} liked your post.`;
      if (post.userId.toString() !== userId) {
        await User.findByIdAndUpdate(post.userId, {
          $push: {
            notifications: {
              type: "post_like",
              senderId: userObjectId,
              postId: postObjectId,
              senderImage:currentUser.profilePicture,
              message: notificationMessage,
            },
          },
        });
      }
    } else {
      // Unlike the post
      await post.updateOne({ $pull: { Likes: userObjectId } });
      res.status(200).json("Post has been unliked");
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return res.status(500).json({ error: "Error liking/unliking post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json("User ID is required");
    }

    // Find the current user and the post
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    const currentUserId = currentUser._id.toString();
    const postUserId = post.userId.toString();

    if (postUserId === currentUserId) {
      const deletePost = await Post.findByIdAndDelete(req.params.id);
      res.status(200).json(deletePost);
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

    // Ensure all required fields are present
    if (!userId || !username || !comments) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if post exists
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if comment has already been made
    const existingComment = existingPost.Comments.find(
      (comment) =>
        comment.userId.toString() === userId.toString() &&
        comment.comments === comments
    );
    if (existingComment) {
      return res.status(409).json({ message: "You said this already!" });
    }

    // Add the new comment
    existingPost.Comments.push({
      userId: new mongoose.Types.ObjectId(userId), // Ensure userId is an ObjectId
      username,
      profilePicture,
      comments,
    });

    const savedComments = await existingPost.save();

    // Notify post owner
    const notificationMessage = `${savedComments.Fullname} commented on your post.`;
    if (existingPost.userId.toString() !== userId.toString()) {
      await User.findByIdAndUpdate(existingPost.userId, {
        $push: {
          notifications: {
            type: "post_comment",
            senderId: userId,
            postId: postId,
            senderImage:savedComments.profilePicture,
            message: notificationMessage,
          },
        },
      });
    }

    res.status(200).json(savedComments);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error", error });
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

  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid postId, commentId, or userId" });
  }
  // Convert userId and postId to ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const postObjectId = new mongoose.Types.ObjectId(postId);

  try {
    const post = await Post.findById(postObjectId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.Comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Like or unlike the comment
    if (!comment.Likes.includes(userId)) {
      comment.Likes.push(userId);
      await post.save();
      // Notify the comment owner if they are not the one liking
      const currentUser = await User.findById(userObjectId);
      if (comment.userId !== userId) {
        await User.findByIdAndUpdate(comment.userId, {
          $push: {
            notifications: {
              type: "like_comment",
              senderId: userId,
              postId: postId,
              senderImage: currentUser.profilePicture,
              message: `${currentUser.Fullname} liked your comment on ${post.Fullname} post.`,
            },
          },
        });
      }
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
  const { postId, commentId } = req.params;
  const { userId, comments } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.Comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() === userId) {
      comment.comments = comments;
      await post.save();
      res.status(200).json("The comment has been updated");
    } else {
      res.status(403).json("You can only update your comment");
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
  updateComments,
};
