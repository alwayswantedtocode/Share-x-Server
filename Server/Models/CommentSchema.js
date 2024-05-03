const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postId: {
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

const commentData = mongoose.model("commentData", commentSchema);
module.exports = commentData;
