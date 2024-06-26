const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    // postId: {
    //   type: String,
    //   required: true,
    // },
    username: {
      type: String,
      require: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    comments: {
      type: String,
      max: 1000,
    },
    Likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    Fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      require: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      max: 1000,
    },
    Image: {
      type: String,
    },
    Likes: {
      type: [String],
      default: [],
    },
    Comments: [commentSchema],
  },
  { timestamps: true }
);

const postData = mongoose.model("postData", postSchema);
module.exports = postData;
