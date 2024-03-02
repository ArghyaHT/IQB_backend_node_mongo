const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate, getAllAppointmentsByBarberIdAndDate, editAppointment, deleteAppointment, barberServedAppointment } = require("../../controllers/Appointments/appointmentsController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");
const verifyRefreshTokenBarber = require("../../middlewares/Barber/VerifyRefreshTokenBarber.js");

const router = express.Router();

router.route("/createAppointment").post(createAppointment);

router.route("/editAppointments").put(verifyRefreshTokenAdmin, editAppointment)

router.route("/deleteAppointments").delete(verifyRefreshTokenAdmin, deleteAppointment)

router.route("/getEngageBarberTimeSlots").post(verifyRefreshTokenAdmin ,getEngageBarberTimeSlots)

router.route("/getAllAppointmentsBySalonId").post(verifyRefreshTokenAdmin ,getAllAppointmentsBySalonId)

router.route("/getAllAppointmentsBySalonIdAndDate").post(verifyRefreshTokenAdmin ,getAllAppointmentsBySalonIdAndDate)




router.route("/getAllAppointmentsByBarberId").post(verifyRefreshTokenBarber ,getAllAppointmentsByBarberId)

router.route("/getAllAppointmentsByBarberIdAndDate").post(verifyRefreshTokenBarber ,getAllAppointmentsByBarberIdAndDate)

router.route("/barberServedAppointment").post(barberServedAppointment)


module.exports = router;