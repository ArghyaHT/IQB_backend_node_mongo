const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId, autoJoin, barberServedQueue, getAvailableBarbersForQ, getBarberByMultipleServiceId, getQlistbyBarberId, cancelQueue, sendQSms, getQhistoryByCustomerEmail } = require("../../controllers/Queueing/joinQueueController")
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
router.route("/getAvailableBarbersForQ").post(handleProtectedRoute, getAvailableBarbersForQ)

//Get Barber By Multiple ServiceId
router.route("/getBarberByMultipleServiceId").post(handleProtectedRoute, getBarberByMultipleServiceId)

//Get Q list by BarberId
router.route("/getQlistByBarberId").post(handleProtectedRoute, getQlistbyBarberId)

//Cancel Q List
router.route("/cancelQ").post(cancelQueue)

//Get Q History
router.route("/getQhistory").post(getQhistoryByCustomerEmail)

//SendSms
router.route("/send-sms").post(sendQSms)

module.exports = router