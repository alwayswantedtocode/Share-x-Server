const User = require("../../Models/UsersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const loginController = async (req, res, next) => {
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

    const { password, isAdmin, ...otherDetails } = user._doc;
    const accessTokenLimits = new Date(Date.now() + 7200000)
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

// const loginController = async (req, res, next) => {
//   try {
//     console.log(" i am in the login ");
//     // const {username, password, email}=req.body
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       console.log("I couldnt find a user");
//       return res.status(404).json("User not found");
//     }

//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );
//     if (validPassword) {
//       const accessToken = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.ACCESS_JWT,
//         { expiresIn: "1h" }
//       );
//       const refreshToken = jwt.sign(
//         { email: user.email, isAdmin: user.isAdmin },
//         process.env.REFRESH_JWT,
//         { expiresIn: "2d" }
//       );

//       const { password, isAdmin, ...otherDetails } = user._doc;
//       res
//         .cookie("access_token", accessToken, { httpOnly: true })
//         .cookie("refresh_token", refreshToken, { httpOnly: true })
//         .status(201)
//         .json({ ...otherDetails, accessToken, refreshToken });
//     } else {
//       return res.status(400).json("Wrong password");
//     }
//   } catch (error) {
//     res.status(500).json(error);
//     next(error);
//   }
// };
module.exports = loginController;
