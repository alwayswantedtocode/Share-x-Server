const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: {
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
      type: [String],
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
    // Image: {
    //   type: String,
    // },
    Media: {
      type: String, // URL of the uploaded image or video
    },
    MediaType: {
      type: String, // 'image' or 'video'
      enum: ["image", "video"],
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
