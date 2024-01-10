const express = require("express");
const { registerFcmToken, sendNotification, getAllNotifications } = require("../../controllers/notifications/notificationController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

// Endpoint for sending notifications
router.route("/send-notification").post(handleProtectedRoute, sendNotification)

//Get All Notifications
router.route("/getAllNotifications").post(handleProtectedRoute, getAllNotifications)


module.exports = router 