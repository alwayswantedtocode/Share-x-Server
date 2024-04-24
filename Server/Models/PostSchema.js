const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    Comments: {
      type: String,
      max: 1000,
    },
  },
  { timestamps: true }
);

const postData = mongoose.model("postData", postSchema);
module.exports = postData;
