const notificationRouters = require("express").Router();
const {getReadNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../../controllers/NotificationController/notificationController");

notificationRouters.get("/:userId/unread", getUnreadNotifications);
notificationRouters.get("/:userId/read", getReadNotifications);
notificationRouters.put("/:notificationId/mark-read", markNotificationAsRead);
notificationRouters.put(
  "/mark-all-read",
  markAllNotificationsAsRead
);


module.exports = notificationRouters;

