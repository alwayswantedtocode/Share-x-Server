

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "new_follower",
        "new_post",
        "post_like",
        "post_comment",
        "like_comment",
        "profile_update"
      ],
      required: true,
    },
    senderId: {
      type: String,
      ref: "userData", // The user who triggered the notification
    },
    postId: {
      type: String,
      ref: "postData", // Optional: The post related to the notification
    },
    commentId: {
      type: String,
      ref: "Comment", // Optional: The comment related to the notification
    },
    senderImage: {
      type: String,
      ref: "Image", // Optional: The comment related to the notification
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    Fullname: {
      type: String,
      min: 3,
      max: 40,
      default: "",
    },
    username: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    Bio: {
      type: String,
      max: 150,
      default: "",
    },
    From: {
      type: String,
      default: "",
    },
    CurrentCity: {
      type: String,
      default: "",
    },
    Workplace: {
      type: String,
      default: "",
    },
    School: {
      type: String,
      default: "",
    },
    Birthday: {
      type: String,
      default: "",
    },
    Gender: {
      type: String,
      default: "",
    },
    notifications: [notificationSchema], // Array of notifications
  },
  { timestamps: true }
);

const userData = mongoose.model("userData", userSchema);
module.exports = userData;
