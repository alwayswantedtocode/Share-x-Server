const User = require("../../Models/UsersSchema");

// Update account
const updateUser = async (req, res, next) => {
  try {
    const {
      Fullname,
      username,
      profilePicture,
      coverPicture,
      From,
      CurrentCity,
      Workplace,
      School,
      Birthday,
      Gender,
      Bio,
    } = req.body;

    // Update user in database with the received data and uploaded image URLs
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          Fullname,
          username,
          profilePicture,
          coverPicture,
          From,
          CurrentCity,
          Workplace,
          School,
          Birthday,
          Gender,
          Bio,
        },
      },
      { new: true }
    );

    const { password, ...otherDetails } = updatedUser._doc;
    // Notify followers of new post
    const user = await User.findById(userId);
    const notificationMessage = `${Fullname} has update their profile.`;
    await Promise.all(
      user.followers.map(async (followerId) => {
        await User.findByIdAndUpdate(followerId, {
          $push: {
            notifications: {
              type: "profile_update",
              senderId: userId,
              senderImage: user.profilePicture,
              message: notificationMessage,
            },
          },
        });
      })
    );
    res.status(200).json({ ...otherDetails });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Error updating user" });
  }
};
// Search for user
const searchForUsers = async (req, res, next) => {
  let { query } = req.query;

  try {
    const user = await User.find({
      $or: [
        { username: { $regex: new RegExp(query, "i") } },
        { Fullname: { $regex: new RegExp(query, "i") } },
      ],
    });
    const sanitizedUsers = user.map((User) => {
      const { _id, username, Fullname } = User;
      return { _id, username, Fullname };
    });
    res.status(200).json(sanitizedUsers);
    // res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
    next(error);
  }
};

//Fetch user profile
const getUsersProfile = async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete Account
const deleteUser = async (req, res, next) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(user + "account has been deleted successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only delete your account");
  }
};

//follow user
const followUser = async (req, res) => {
  const { accountUserId } = req.body; // Current user
  const friendUserId = req.params.id; // User being followed

  if (accountUserId === friendUserId) {
    return res.status(403).json({ error: "You cannot follow yourself." });
  }

  try {
    const user = await User.findById(friendUserId);
    const currentUser = await User.findById(accountUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // If already following
    if (user.followers.includes(accountUserId)) {
      return res.status(403).json({ error: "You already follow this user." });
    }

    await user.updateOne({ $push: { followers: accountUserId } });
    await currentUser.updateOne({ $push: { followings: friendUserId } });

    // Create a notification
    const notificationMessage = `${currentUser.username} started following you.`;
    await user.updateOne({
      $push: {
        notifications: {
          type: "new_follower",
          senderId: accountUserId,
          message: notificationMessage,
        },
      },
    });

    const updatedCurrentUser = await User.findById(accountUserId);
    const updatedUser = await User.findById(friendUserId);

    res.status(200).json({
      message: "Successfully followed the user.",
      updatedCounts: {
        currentUser: {
          followingsCount: updatedCurrentUser.followings.length,
          followersCount: updatedCurrentUser.followers.length,
        },
        friendUser: {
          followingsCount: updatedUser.followings.length,
          followersCount: updatedUser.followers.length,
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while following the user." });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  const { accountUserId } = req.body; // Current user
  const friendUserId = req.params.id; // User being unfollowed

  if (accountUserId === friendUserId) {
    return res.status(403).json({ error: "You cannot unfollow yourself." });
  }

  try {
    const user = await User.findById(friendUserId);
    const currentUser = await User.findById(accountUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.followers.includes(accountUserId)) {
      return res
        .status(403)
        .json({ error: "You are not following this user." });
    }

    await user.updateOne({ $pull: { followers: accountUserId } });
    await currentUser.updateOne({ $pull: { followings: friendUserId } });

    const updatedCurrentUser = await User.findById(accountUserId);
    const updatedUser = await User.findById(friendUserId);

    res.status(200).json({
      message: "Successfully unfollowed the user.",
      updatedCounts: {
        currentUser: {
          followingsCount: updatedCurrentUser.followings.length,
          followersCount: updatedCurrentUser.followers.length,
        },
        friendUser: {
          followingsCount: updatedUser.followings.length,
          followersCount: updatedUser.followers.length,
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while unfollowing the user." });
  }
};

//Get the array of user followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const followers = await Promise.all(
      user.followers.map((followerId) => {
        return User.findById(followerId);
      })
    );
    let followersList = [];
    followers.map((follower) => {
      const { _id, username, profilePicture } = follower;
      followersList.push({ _id, username, profilePicture });
    });
    res.status(200).json(followersList);
  } catch (err) {
    res.status(500).json(err);
  }
};
//Get the array of user followings
const getFollowings = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const followings = await Promise.all(
      user.followings.map((followingId) => {
        return User.findById(followingId);
      })
    );
    let followingsList = [];
    followings.map((following) => {
      const { _id, username, profilePicture } = following;
      followingsList.push({ _id, username, profilePicture });
    });
    res.status(200).json(followingsList);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  updateUser,
  searchForUsers,
  getUsersProfile,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowings,
};
