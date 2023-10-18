const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId } = require("../../controllers/Queueing/joinQueueController")

const router = express.Router()

router.route("/singleJoinQueue").post(singleJoinQueue)

router.route("/groupJoinQueue").post(groupJoinQueue)

router.route("/getQListBySalonId").get(getQueueListBySalonId)

module.exports = router