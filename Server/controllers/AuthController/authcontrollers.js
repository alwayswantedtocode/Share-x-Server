const User = require("../../Models/UsersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const register = async (req, res, next) => {
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




const login = async (req, res, next) => {
  try {
    console.log(" i am in the login ");
    // const {username, password, email}=req.body
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("I couldnt find a user");
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("Wrong username or password");
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_JWT, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_JWT, {
      expiresIn: "2d",
    });

    const { password, isAdmin, ...otherDetails } = user._doc;
    const accessTokenLimits = new Date(Date.now() + 7200000);
    const refreshTokenLimits = new Date(Date.now() + 172800000);
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        expires: accessTokenLimits,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        expires: refreshTokenLimits,
      })
      .status(201)
      .json({ ...otherDetails, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json(error);
    next(error);
  }
};






module.exports = { register, login };
