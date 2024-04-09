const User = require("../../Models/UsersSchema");

const followUserController = async (req, res, next) => {
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

module.exports = followUserController;