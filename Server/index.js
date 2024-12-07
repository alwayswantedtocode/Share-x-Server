// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const cors = require("cors");
// const CorsOption = require("./Config/CorsOption");
// const Credentials = require("./Middleware/Credentials");
// const cookie = require("cookie-parser");
// const userRouters = require("./Routes/UserRouter/userRouters");
// const authRouters = require("./Routes/AuthRouter/authRouters");
// const postRouters = require("./Routes/PostRouter/postRouters");
// const verifyTokenrRoute = require("./Routes/UserRouter/verifyTokenRouter");
// const verifyAdminrRoute = require("./Routes/UserRouter/verifyAdminRouter");

// const PORT = process.env.PORT || 5050;

// const app = express();

// dotenv.config();

// //middleware
// app.use(Credentials);
// app.use(cors(CorsOption));
// app.use(express.json());
// app.use(helmet());
// app.use(morgan("common"));
// app.use(cookie());

// app.use("/api/users", userRouters);
// app.use("/api/usersauth", authRouters);
// app.use("/api/posts", postRouters);

// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     app.listen(PORT, () => {
//       console.log(`Server up and running on port ${PORT}`);
//     });
//     console.log("Connected to mongodb!");
//   } catch (error) {
//     console.log(error);
//   }
// };
// startServer();

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const CorsOption = require("./Config/CorsOption");
const Credentials = require("./Middleware/Credentials");
const cookie = require("cookie-parser");
const userRouters = require("./Routes/UserRouter/userRouters");
const authRouters = require("./Routes/AuthRouter/authRouters");
const postRouters = require("./Routes/PostRouter/postRouters");
const notificationRouters=require("./Routes/NotificationRoute/notificationRoute")
const verifyTokenrRoute = require("./Routes/UserRouter/verifyTokenRouter");
const verifyAdminrRoute = require("./Routes/UserRouter/verifyAdminRouter");
const http = require("http"); // Import http for server creation
const { Server } = require("socket.io"); // Import socket.io server
const {
  postEventEmitter,
} = require("./controllers/PostController/postControllers");

const PORT = process.env.PORT || 5050;

const app = express();

dotenv.config();

// Middleware
app.use(Credentials);
app.use(cors(CorsOption));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookie());

app.use("/api/users", userRouters);
app.use("/api/usersauth", authRouters);
app.use("/api/posts", postRouters);
app.use("/api/notifications",notificationRouters)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Create HTTP server
const server = http.createServer(app);

// Create socket.io server instance
const io = new Server(server, {
  cors: {
    origin: CorsOption.origin, // Allow same origin connections for sockets
  },
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    server.listen(PORT, () => {
      console.log(`Server up and running on port ${PORT}`);
    });
    console.log("Connected to mongodb!");

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log("New socket connected!");

      // Handle socket events for new posts
      socket.on("newPost", (newPostData) => {
        console.log("New post created:", newPostData);

        io.emit("newPost", newPostData); 
      });

      // Listen for a user joining a room (following a user)
      socket.on("followUser", (followedUserId) => {
        console.log(`User is following: ${followedUserId}`);
        socket.join(followedUserId); // User joins the room of the user they're following
      });

//add this cos one stackover flow guy told me esocket event had no room to join
     socket.on("joinRoom", (postId) => {
       socket.join(postId);
       console.log(`Socket ${socket.id} joined room: ${postId}`);
     });

     
     socket.on("leaveRoom", (postId) => {
       socket.leave(postId);
       console.log(`Socket ${socket.id} left room: ${postId}`);
     });
      
      // Handle socket events for comments
      socket.on("commentOnPost", (postId, commentData) => {
        console.log("Comment posted on post:", postId, commentData);

        // io.emit(`newComment-${postId}`, commentData);
        io.to(postId).emit(`newComment-${postId}`, { postId, commentData });
        console.log("Broadcasting to room:", postId, { postId, commentData }); // Log
      });


      // Handle post like/dislike events
      postEventEmitter.on("postLiked", ({ postId, userId, action }) => {
        console.log(`Post ${postId} was ${action} by user ${userId}`);
        io.emit(`newLike-${postId}`, { userId, action }); // Broadcast to clients
      });

      // Handle socket events for following a user
      socket.on("followUser", (followedUserId) => {
        console.log("User followed:", followedUserId);
        // Emit follow event to all users following the followed user
        io.to(followedUserId).emit("newFollower", socket.id); // Notify followed user of new follower
      });

      // Handle disconnections
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
