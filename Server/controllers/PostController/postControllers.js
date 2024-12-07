const Post = require("../../Models/PostSchema");
const User = require("../../Models/UsersSchema");
const mongoose = require("mongoose");
const EventEmitter = require("events");
const postEventEmitter = new EventEmitter();

const createPost = async (req, res) => {
  try {
    const {
      userId,
      Fullname,
      username,
      Description,
      Media,
      MediaType,
      profilePicture,
    } = req.body;
    const currentUser = await User.findById(userId);
    // Check for required fields
    if (!userId || !username) {
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
      profilePicture: currentUser.profilePicture,
      Fullname,
      username,
      Description,
      Media,
      MediaType,
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
              senderImage: currentUser.profilePicture,
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
    const {
      Fullname,
      username,
      Description,
      Media,
      MediaType,
      profilePicture,
    } = req.body;
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
        profilePicture: currentUser.profilePicture,
        Fullname,
        username,
        Description,
        Media,
        MediaType,
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

    const enrichedUserPosts = userPosts.map((post) => {
      const plainPost = post.toObject(); // Convert to plain JavaScript object
      return {
        ...plainPost,
        userProfilePicture: currentUser.profilePicture,
        username: currentUser.username,
      };
    });

    const friendPosts = await Promise.all(
      currentUser.followings.map(async (friendId) => {
        const friend = await User.findById(friendId);

        const posts = await Post.find({ userId: friendId });
        return posts.map((post) => {
          const plainPost = post.toObject();
          return {
            ...plainPost,
            userProfilePicture: friend.profilePicture,
            username: friend.username,
          };
        });
      })
    );

    const timelinePosts = enrichedUserPosts.concat(...friendPosts);
    res.status(200).json(timelinePosts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

const profilePosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    const posts = await Post.find({ userId: user._id });

    const enrichedPosts = posts.map((post) => {
      const plainPost = post.toObject(); // Convert to plain JavaScript object
      return {
        ...plainPost,
        userProfilePicture: user.profilePicture,
        username: user.username,
      };
    });

    // Send response
    res.status(200).json(enrichedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

const likedislikePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const postObjectId = new mongoose.Types.ObjectId(postId);

    const post = await Post.findById(postObjectId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentUser = await User.findById(userObjectId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let message;

    if (!post.Likes.includes(userObjectId)) {
      await post.updateOne({ $push: { Likes: userObjectId } });
      message = "Post has been liked";

      // Emit like event for Socket.IO
      postEventEmitter.emit("postLiked", {
        postId,
        userId,
        action: "liked",
      });

      // Notify post owner of the like
      const notificationMessage = `${currentUser.Fullname} liked your post.`;
      if (post.userId.toString() !== userId) {
        await User.findByIdAndUpdate(post.userId, {
          $push: {
            notifications: {
              type: "post_like",
              senderId: userObjectId,
              postId: postObjectId,
              senderImage: currentUser.profilePicture,
              message: notificationMessage,
            },
          },
        });
      }
    } else {
      await post.updateOne({ $pull: { Likes: userObjectId } });
      message = "Post has been unliked";

      // Emit dislike event for Socket.IO
      postEventEmitter.emit("postLiked", {
        postId,
        userId,
        action: "disliked",
      });
    }
    const updatedPost = await Post.findById(postObjectId);
    const likesCount = updatedPost.Likes.length;
    const likesList = updatedPost.Likes;
    res.status(200).json({
      message,
      likes: likesCount,
      List: likesList,
    });
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

    const currentUser = await User.findById(userId);

    if (!userId || !username || !comments) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingComment = existingPost.Comments.find(
      (comment) =>
        comment.userId.toString() === userId.toString() &&
        comment.comments === comments
    );
    if (existingComment) {
      return res.status(409).json({ message: "You said this already!" });
    }

    const newComment = {
      userId: new mongoose.Types.ObjectId(userId),
      username,
      profilePicture: currentUser.profilePicture,
      comments,
    };

    existingPost.Comments.push(newComment);
    await existingPost.save();
    
   // Emit the new comment to all clients in the post room
    // if (req.io) {
    //   req.io.to(postId).emit("newComment", { postId, comment: newComment });
    //   console.log("Comment posted on post:", postId, newComment);
    // } else {
    //   console.error("Socket.io instance (req.io) is not defined.");
    // }
    // Notify post owner
    if (
      existingPost.userId &&
      existingPost.userId.toString() !== userId.toString()
    ) {
      await User.findByIdAndUpdate(existingPost.userId, {
        $push: {
          notifications: {
            type: "post_comment",
            senderId: userId,
            postId: postId,
            senderImage: currentUser.profilePicture,
            message: `${currentUser.Fullname} commented on your post.`,
          },
        },
      });
    }
    res
      .status(200)
      .json(existingPost.Comments[existingPost.Comments.length - 1]);
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
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.Comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isLiked = comment.Likes.some((id) => id === userId);

    let message;

    if (!isLiked) {
      // Like the comment
      comment.Likes.push(userObjectId);
      message = "Comment has been liked";

      // Notify the comment owner
      const currentUser = await User.findById(userObjectId);
      if (comment.userId.toString() !== userId) {
        await User.findByIdAndUpdate(comment.userId, {
          $push: {
            notifications: {
              type: "like_comment",
              senderId: userId,
              postId,
              senderImage: currentUser.profilePicture,
              message: `${currentUser.Fullname} liked your comment on ${post.Fullname}'s post.`,
            },
          },
        });
      }
    } else {
      // Unlike the comment
      comment.Likes = comment.Likes.filter((id) => id !== userId);
      message = "Comment has been unliked";
    }

    // Save the post with the updated comment
    await post.save();

    const likesCount = comment.Likes.length;

    res.status(200).json({ message, likes: likesCount });
  } catch (error) {
    console.error("Error liking/disliking comment:", error);
    res.status(500).json({ error: "Error liking/disliking comment" });
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
  postEventEmitter,
};
