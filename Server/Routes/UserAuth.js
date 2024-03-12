const router = require("express").Router();
const User = require("../Models/UsersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

//Register
router.post("/register", async (req, res, next) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
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
});

//Login
router.post("/signIn", async (req, res, next) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.ACCESS_JWT,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.REFRESH_JWT,
      { expiresIn: "2d" }
    );

    const { password , isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", accessToken, { httpOnly: true })
      .cookie("refresh_token", refreshToken, { httpOnly: true })
      .status(200)
      .json({ ...otherDetails, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json(error);
    next(error);
  }
});

// Logout endpoint
router.post("/logout", async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ message: "Logout failed" });
    next(error);
  }
});

module.exports = router;
