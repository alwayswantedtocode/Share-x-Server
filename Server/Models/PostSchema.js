const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      max: 1000,
    },
    Image: {
      type: String,
    },
    Likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const postData = mongoose.model("postData", postSchema);
module.exports = postData;
