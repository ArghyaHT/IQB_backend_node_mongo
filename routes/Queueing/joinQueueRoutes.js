const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId, autoJoin, barberServedQueue, getAvailableBarbersForQ, getBarberByMultipleServiceId } = require("../../controllers/Queueing/joinQueueController")
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController")

const router = express.Router()

//Single Join
router.route("/singleJoinQueue").post(handleProtectedRoute,singleJoinQueue)

//Group Join
router.route("/groupJoinQueue").post(handleProtectedRoute,groupJoinQueue)

//getQListBySalonId
router.route("/getQListBySalonId").get(handleProtectedRoute,getQueueListBySalonId)

//Auto Join
router.route("/autoJoin").post(handleProtectedRoute,autoJoin),

//BarberServed Api
router.route("/barberServedQueue").post(handleProtectedRoute,barberServedQueue)

//Get Available Barbers for Queue
router.route("/getAvailableBarbersForQ").post(getAvailableBarbersForQ)

//Get Barber By Multiple ServiceId
router.route("/getBarberByMultipleServiceId").post(getBarberByMultipleServiceId)

module.exports = router