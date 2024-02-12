const express = require("express");
const { sendQSms } = require("../../controllers/mobileMessageSender/mobileMessage.js");
const router = express.Router();

//SendSms
router.route("/send-sms").post(sendQSms)

module.exports = router