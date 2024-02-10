const express = require("express")
const { singleJoinQueue, groupJoinQueue, getQueueListBySalonId, autoJoin, barberServedQueue, getAvailableBarbersForQ, getBarberByMultipleServiceId, getQlistbyBarberId, cancelQueue, sendQSms, getQhistoryByCustomerEmail } = require("../../controllers/Queueing/joinQueueController")
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController")

const router = express.Router()

//Single Join
router.route("/singleJoinQueue").post(handleAdminProtectedRoute,singleJoinQueue)

//Group Join
router.route("/groupJoinQueue").post(handleAdminProtectedRoute,groupJoinQueue)

//getQListBySalonId
router.route("/getQListBySalonId").get(handleAdminProtectedRoute,getQueueListBySalonId)

//Auto Join
router.route("/autoJoin").post(handleAdminProtectedRoute,autoJoin),

//BarberServed Api
router.route("/barberServedQueue").post(handleAdminProtectedRoute,barberServedQueue)

//Get Available Barbers for Queue
router.route("/getAvailableBarbersForQ").post(handleAdminProtectedRoute, getAvailableBarbersForQ)

//Get Barber By Multiple ServiceId
router.route("/getBarberByMultipleServiceId").post(handleAdminProtectedRoute, getBarberByMultipleServiceId)

//Get Q list by BarberId
router.route("/getQlistByBarberId").post(handleAdminProtectedRoute, getQlistbyBarberId)

//Cancel Q List
router.route("/cancelQ").post(cancelQueue)

//Get Q History
router.route("/getQhistory").post(getQhistoryByCustomerEmail)

//SendSms
router.route("/send-sms").post(sendQSms)

module.exports = router