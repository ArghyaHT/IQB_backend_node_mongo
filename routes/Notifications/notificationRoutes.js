const express = require("express");
const { registerFcmToken, sendNotification, getAllNotifications, sendNotificationToAndroid, multiplesendNotification } = require("../../controllers/notifications/notificationController");
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");
const { handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");

const router = express.Router();

// Endpoint for sending notifications for web
router.route("/send-notification").post(verifyRefreshTokenAdmin, sendNotification)

//Send Multiple Notification
router.route("/send-multiple-notification").post(verifyRefreshTokenAdmin, multiplesendNotification)

// Endpoint for sending notifications for web
router.route("/send-notification-android").post(sendNotificationToAndroid)

//Get All Notifications
router.route("/getAllNotifications").post(handleBarberProtectedRoute, getAllNotifications)




module.exports = router 