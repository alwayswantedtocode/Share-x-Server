const User = require("../../Models/UsersSchema");

const updateUserController = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    const { password, ...otherDetails } = user._doc;
    res.status(200).json({ ...otherDetails });
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = updateUserController;


// const User = require("../../Models/UsersSchema");
// const bcrypt = require("bcrypt");

// const updateUserController = async (req, res, next) => {
//   if (req.body.userId === req.params.id || req.body.isAdmin) {
//     if (req.body.password) {
//       try {
//         const salt = await bcrypt.genSalt(10);
//         req.body.password = await bcrypt.hash(req.body.password, salt);
//       } catch (err) {
//         return res.status(500).json(err);
//       }
//     }
//     try {
//       const user = await User.findByIdAndUpdate(req.params.id, {
//         $set: req.body,
//       });
//       const { password, ...otherDetails } = user._doc;
//       res.status(200).json({ ...otherDetails });
//     } catch (err) {
//       return res.status(500).json(err);
//     }
//   } else {
//     return res.status(403).json("You can update only your account!");
//   }
// };

// module.exports = updateUserController;
