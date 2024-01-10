const express = require("express");
const { registerFcmToken, sendNotification, getAllNotifications } = require("../../controllers/notifications/notificationController");

const router = express.Router();

// Endpoint for sending notifications
router.route("/send-notification").post(sendNotification)

//Get All Notifications
router.route("/getAllNotifications").post(getAllNotifications)


module.exports = router 