const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouters = require("./Routes/UserRouter/userRouters");
const authRouters = require("./Routes/AuthRouter/authRouters");
const postRouters = require("./Routes/PostRouter/postRouters");
const commentRouter = require("./Routes/comments");
const cors = require("cors");
const CorsOption = require("./Config/CorsOption");
const Credentials = require("./Middleware/Credentials");
const cookie = require("cookie-parser");

const verifyTokenrRoute = require("./Routes/UserRouter/verifyTokenRouter");
const verifyAdminrRoute = require("./Routes/UserRouter/verifyAdminRouter");

const PORT = process.env.PORT || 5050;

const app = express();

dotenv.config();

//middleware
app.use(Credentials);
app.use(cors(CorsOption ));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookie());

app.use("/api/users", userRouters);
app.use("/api/usersauth", authRouters);
app.use("/api/posts", postRouters);
// app.use("/api/comments", commentRouter);
// app.use("/api/usersauth", loginRouter);
// app.use("/api/usersauth", registerRouter);

// app.use("/api/posts", postRouter);
// app.use("/api/posts", timelineRouter);
// app.use("/api/posts", userPostRouter);
// app.use("/api/posts", updatePostRouter);
// app.use("/api/posts", likeRouter);
// app.use("/api/posts", getPostRouter);
// app.use("/api/posts", deletePostRouter);

// app.use("/api/users", searchUsersRouter);
// app.use("/api/users", deleteUserRoute);
// app.use("/api/users", followUserRoute);
// app.use("/api/users", unFollowUserRoute);
// app.use("/api/users", getFollowingsRouter);
// app.use("/api/users", getFollowersRouter);
// app.use("/api/users", updateUserRoute);
// app.use("/api/users", verifyTokenrRoute);
// app.use("/api/users", verifyAdminrRoute);


const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(PORT, () => {
      console.log(`Server up and running on port ${PORT}`);
    });
    console.log("Connected to mongodb!");
  } catch (error) {
    console.log(error);
  }
};
startServer();
