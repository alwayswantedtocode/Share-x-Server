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

const commenttData = mongoose.model("commenttData", commentSchema);
module.exports = commenttData;
