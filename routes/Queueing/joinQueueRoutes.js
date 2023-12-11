const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId, autoJoin, barberServedQueue } = require("../../controllers/Queueing/joinQueueController")
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController")

const router = express.Router()

router.route("/singleJoinQueue").post(handleProtectedRoute,singleJoinQueue)

router.route("/groupJoinQueue").post(handleProtectedRoute,groupJoinQueue)

router.route("/getQListBySalonId").get(handleProtectedRoute,getQueueListBySalonId)

router.route("/autoJoin").post(handleProtectedRoute,autoJoin),

router.route("/barberServedQueue").post(handleProtectedRoute,barberServedQueue)

module.exports = router