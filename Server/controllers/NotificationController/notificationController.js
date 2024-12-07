const User = require("../../Models/UsersSchema");
const mongoose = require("mongoose");

const getUnreadNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadNotifications = user.notifications.filter(
      (notification) => !notification.isRead
    );

    res.status(200).json(unreadNotifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
};

const getReadNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadNotifications = user.notifications.filter(
      (notification) => notification.isRead
    );

    res.status(200).json(unreadNotifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userId = req.query.userId;

    const notificationObjectId = new mongoose.Types.ObjectId(notificationId);

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("users notification:", currentUser?.notifications);

    const notification = currentUser.notifications.find((n) =>
      n._id.equals(notificationObjectId)
    );

    console.log("notification:", notification);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await currentUser.save();

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
      const userId = req.query.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.notifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
      }
    });

    await currentUser.save(); 

    res.status(200).json({
      message: "All notifications marked as read",
      notifications: currentUser.notifications,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

module.exports = {
  getReadNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
