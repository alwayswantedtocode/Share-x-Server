const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true },
    senderId: { type: String, required: true },
    type: {
      type: String,
      enum: ["new_follower", "new_post", "post_like", "post_comment" ,"like_comment"],
      required: true,
    },
    postId: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
