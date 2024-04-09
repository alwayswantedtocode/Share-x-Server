const User = require("../../Models/UsersSchema");

const unfollowUserController = async (req, res, next) => {
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

module.exports = unfollowUserController;