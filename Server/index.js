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

app.use("/api/users", userRoute);
app.use("/api/usersauth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRouter);

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
