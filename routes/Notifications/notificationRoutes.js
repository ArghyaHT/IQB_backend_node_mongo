const express = require("express");
const { registerFcmToken, sendNotification, getAllNotifications, sendNotificationToAndroid, multiplesendNotification } = require("../../controllers/notifications/notificationController");
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

// Endpoint for sending notifications for web
router.route("/send-notification").post(handleAdminProtectedRoute, sendNotification)

//Send Multiple Notification
router.route("/send-multiple-notification").post(handleAdminProtectedRoute, multiplesendNotification)

// Endpoint for sending notifications for web
router.route("/send-notification-android").post(sendNotificationToAndroid)

//Get All Notifications
router.route("/getAllNotifications").post(handleAdminProtectedRoute, getAllNotifications)




module.exports = router 