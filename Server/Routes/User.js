const router = require("express").Router();
const User = require("../Models/UsersSchema");
const {
  verifyToken,
  verifyUser,
  verifyAdmin,
} = require("../utils/Verifytoken");

//verify token
router.get("/checkauthentication", verifyToken, (req, res, next) => {
  res.send("Hello you are logged in");
});

//Verify user
// router.get("/checkuser/:id", verifyUser, (req, res, next) => {
//   res.send("You have full Authorization to this account");
// });

//Verify Admin
router.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
  res.send("You have full Authorization to all account");
});

//Update user
router.put("/:id", verifyUser, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    }, { new: true });
    
     const { password, ...otherDetails } = user._doc;
    res.status(200).json({ ...otherDetails });
  } catch (error) {
    return res.status(500).json(error);
  }
});

//Delete user
router.delete("/:id", verifyUser, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only delete your account");
  }
});
//Get a user

router.get("/", verifyUser, async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//Follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
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
});

//Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
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
});

module.exports = router;
