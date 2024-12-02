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
// const http = require("http");
// const { Server } = require("socket.io");

// dotenv.config();

// const PORT = process.env.PORT || 5050;
// const app = express();

// // Middleware
// app.use(Credentials);
// app.use(cors(CorsOption));
// app.use(express.json());
// app.use(helmet());
// app.use(morgan("common"));
// app.use(cookie());

// // Routes
// app.use("/api/users", userRouters);
// app.use("/api/usersauth", authRouters);
// app.use("/api/posts", postRouters);

// // Create HTTP server
// const server = http.createServer(app);

// // Create socket.io server instance
// const io = new Server(server, {
//   cors: {
//     origin: CorsOption.origin, // Allow same origin connections for sockets
//   },
// });

// // Active users map
// const activeUsers = new Map();

// // Start server function
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected to MongoDB!");

//     // Socket.io connection handling
//     io.on("connection", (socket) => {
//       console.log("New socket connected:", socket);

//       // Track user connections
//       // socket.on("userConnected", (userId) => {
//       //   console.log(`User connected: ${userId}`);
//       //   activeUsers.set(userId, socket.id);
//       // });

//       // New post event
//       socket.on("newPost", (newPostData) => {
//         console.log("New post created:", newPostData);

//         // Notify all followers of the post creator
//         const { followers } = newPostData; // Ensure this is provided
//         if (followers) {
//           followers.forEach((followerId) => {
//             const followerSocketId = activeUsers.get(followerId);
//             if (followerSocketId) {
//               io.to(followerSocketId).emit("newPostNotification", newPostData);
//             }
//           });
//         }
//       });

//       // Comment on post event
//       socket.on("commentOnPost", ({ postId, commentData }) => {
//         console.log("New comment on post:", postId, commentData);

//         // Notify all followers of the post owner about the comment
//         io.emit(`newComment-${postId}`, commentData);
//       });

//       // Like post event
//       socket.on("likePost", ({ postId, userId }) => {
//         console.log("Post liked:", postId, userId);

//         // Notify the post owner about the like
//         const postOwnerSocketId = activeUsers.get(postId.ownerId); // Ensure ownerId is provided
//         if (postOwnerSocketId) {
//           io.to(postOwnerSocketId).emit("postLikedNotification", {
//             postId,
//             userId,
//           });
//         }
//       });

//       // Follow user event
//       socket.on("followUser", ({ followedUserId, followerId }) => {
//         console.log("New follower event:", followedUserId, followerId);

//         // Notify the followed user
//         const followedUserSocketId = activeUsers.get(followedUserId);
//         if (followedUserSocketId) {
//           io.to(followedUserSocketId).emit("newFollowerNotification", {
//             followerId,
//           });
//         }
//       });

//       // Disconnect handling
//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);

//         // Remove the user from active users map
//         for (const [userId, socketId] of activeUsers.entries()) {
//           if (socketId === socket.id) {
//             activeUsers.delete(userId);
//             break;
//           }
//         }
//       });
//     });

//     // Start listening on the server
//     server.listen(PORT, () => {
//       console.log(`Server up and running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//   }
// };

// // Start the server
// startServer();
