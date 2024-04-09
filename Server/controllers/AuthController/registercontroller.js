const User = require("../../Models/UsersSchema");
const bcrypt = require("bcrypt");

const registerController = async (req, res, next) => {
  try {
    // Check if the user already exists
    console.log("i am in the register");
    const existingUser = await User.findOne({
      //   $or: [{ email: req.body.email }, { username: req.body.username }],
      email: req.body.email,
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or Email already exists" });
    }
    //generate hashed pasword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new users
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
    next(error);
  }
};
module.exports = registerController;
