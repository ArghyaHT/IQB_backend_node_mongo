const express = require("express");
const { registerFcmToken, sendNotification, getAllNotifications, sendNotificationToAndroid } = require("../../controllers/notifications/notificationController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

// Endpoint for sending notifications for web
router.route("/send-notification").post(handleProtectedRoute, sendNotification)

// Endpoint for sending notifications for web
router.route("/send-notification-android").post(sendNotificationToAndroid)

//Get All Notifications
router.route("/getAllNotifications").post(handleProtectedRoute, getAllNotifications)




module.exports = router 