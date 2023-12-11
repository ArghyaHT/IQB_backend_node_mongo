const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId, autoJoin, barberServedQueue } = require("../../controllers/Queueing/joinQueueController")
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController")

const router = express.Router()

router.route("/singleJoinQueue").post(singleJoinQueue)

router.route("/groupJoinQueue").post(groupJoinQueue)

router.route("/getQListBySalonId").get(handleProtectedRoute,getQueueListBySalonId)

router.route("/autoJoin").post(autoJoin),

router.route("/barberServedQueue").post(barberServedQueue)

module.exports = router