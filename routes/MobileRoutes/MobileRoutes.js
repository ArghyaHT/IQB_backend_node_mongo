const express = require("express");
const { getAllSalons, allSalonServices } = require("../../controllers/admin/salonRegisterController");
const { singleJoinQueue, groupJoinQueue, autoJoin, barberServedQueue, getAvailableBarbersForQ, getBarberByMultipleServiceId, getQlistbyBarberId, getQueueListBySalonId } = require("../../controllers/Queueing/joinQueueController");
const { createAppointment, editAppointment, deleteAppointment, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate, getAllAppointmentsByBarberId, getAllAppointmentsByBarberIdAndDate } = require("../../controllers/Appointments/appointmentsController");
const { sendMailToCustomer, } = require("../../controllers/customer/customerRegisterController");
const { getAllBarberbySalonId } = require("../../controllers/barber/barberRegisterController");
const { getAdvertisements } = require("../../controllers/Dashboard/dashboardController");

const router = express.Router();

//Salon Routes

//GetAll Salons
router.route("/getAllSalonsMob").get(getAllSalons)

//All Salon Services
router.route("/getAllSalonServices").get(allSalonServices)



//Barber Routes
router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId)



//Customer Routes for Mobile
router.route("/sendMailToCustomer").post(sendMailToCustomer)


//Appointment Routes for mobile
router.route("/createAppointment").post(createAppointment);

router.route("/editAppointments").put(editAppointment)

router.route("/deleteAppointments").delete(deleteAppointment)

router.route("/getEngageBarberTimeSlots").post(getEngageBarberTimeSlots)

router.route("/getAllAppointmentsBySalonId").post(getAllAppointmentsBySalonId)

router.route("/getAllAppointmentsBySalonIdAndDate").post(getAllAppointmentsBySalonIdAndDate)

router.route("/getAllAppointmentsByBarberId").post(getAllAppointmentsByBarberId)

router.route("/getAllAppointmentsByBarberIdAndDate").post(getAllAppointmentsByBarberIdAndDate)









//Queue Routes for Mobile

//Single Join
router.route("/singleJoinQueue").post(singleJoinQueue)

//Group Join
router.route("/groupJoinQueue").post(groupJoinQueue)

//Auto Join
router.route("/autoJoin").post(autoJoin),

//BarberServed Api
router.route("/barberServedQueue").post(barberServedQueue)

//Get Available Barbers for Queue
router.route("/getAvailableBarbersForQ").post(getAvailableBarbersForQ)

//Get Barber By Multiple ServiceId
router.route("/getBarberByMultipleServiceId").post(getBarberByMultipleServiceId)

//Get Q list by BarberId
router.route("/getQlistByBarberId").post(getQlistbyBarberId)

//Get Q list by Salon Id
router.route("/getQlistBySalonId").get(getQueueListBySalonId)


//Get Advertisements
router.route("/getAllAdvertisements").post(getAdvertisements)



module.exports = router 