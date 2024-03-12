const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./Routes/User");
const authRoute = require("./Routes/UserAuth");
const postRoute = require("./Routes/Posts");
const commentRouter =require("./Routes/comments")
const cors = require("cors")
const cookie = require("cookie-parser");

const app = express();

dotenv.config();

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());
app.use(cookie());

app.use("/api/users", userRoute);
app.use("/api/usersauth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRouter);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(5050, () => {
      console.log("Server is up and running");
    });
    console.log("Connected to mongodb!");
  } catch (error) {
    console.log(error);
  }
};
startServer();
