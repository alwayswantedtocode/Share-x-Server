const User = require("../../Models/UsersSchema");

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
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
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
    res.status(200).json({ ...otherDetails });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Error updating user" });
  }
};

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

const followUser = async (req, res, next) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json("User have followed user");
      } else {
        res.status(403).json("you already follow this user");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json("you can't folllow yourself");
  }
};

const unfollowUser = async (req, res, next) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.body.id } });
        res.status(200).json("User have unfollowed user");
      } else {
        res.status(403).json("you don't follow this user");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json("you can't unfolllow yourself");
  }
};

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
