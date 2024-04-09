const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./Routes/User");
const authRoute = require("./Routes/UserAuth");
const postRoute = require("./Routes/Posts");
const commentRouter = require("./Routes/comments");
const cors = require("cors");
const CorsOption = require("./Config/CorsOption");
const Credentials = require("./Middleware/Credentials");
const cookie = require("cookie-parser");
const loginRouter = require("./Routes/AuthRouter/LoginRouter");
const registerRouter = require("./Routes/AuthRouter/registerRouter");
const postRouter = require("./Routes/PostRouter/postRouter");
const timelineRouter = require("./Routes/PostRouter/timelineRouter");
const userPostRouter = require("./Routes/PostRouter/userpostRouter")
const updatePostRouter = require("./Routes/PostRouter/updatePostRouter")
const likeRouter = require("./Routes/PostRouter/likeRouter")
const getPostRouter = require("./Routes/PostRouter/getPostRouter")
const deletePostRouter = require("./Routes/PostRouter/DeletePostRouter")
const getUserRouter = require("./Routes/UserRouter/getUserRouter")
const deleteUserRoute = require("./Routes/UserRouter/deleteUserRouter")
const followUserRoute = require("./Routes/UserRouter/followUserRouter")
const unFollowUserRoute = require("./Routes/UserRouter/unFollowUserRouter")
const updateUserRoute = require("./Routes/UserRouter/updateUserRouter")
const verifyTokenrRoute = require("./Routes/UserRouter/verifyTokenRouter")
const verifyAdminrRoute =require("./Routes/UserRouter/verifyAdminRouter")

const PORT = process.env.PORT || 5050;

const app = express();

dotenv.config();

//middleware
app.use(Credentials);
app.use(cors(CorsOption));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookie());

// app.use("/api/users", userRoute);
// app.use("/api/usersauth", authRoute);
// app.use("/api/posts", postRoute);
app.use("/api/comments", commentRouter);
app.use("/api/usersauth", loginRouter);
app.use("/api/usersauth", registerRouter);
app.use("/api/posts", postRouter);
app.use("/api/posts", timelineRouter);
app.use("/api/posts", userPostRouter);
app.use("/api/posts", updatePostRouter);
app.use("/api/posts", likeRouter);
app.use("/api/posts", getPostRouter);
app.use("/api/posts", deletePostRouter);

app.use("/api/users", getUserRouter);
app.use("/api/users", deleteUserRoute);
app.use("/api/users", followUserRoute);
app.use("/api/users", unFollowUserRoute);
app.use("/api/users", updateUserRoute);
app.use("/api/users", verifyTokenrRoute);
app.use("/api/users", verifyAdminrRoute);


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
