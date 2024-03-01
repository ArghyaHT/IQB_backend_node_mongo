const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate, getAllAppointmentsByBarberIdAndDate, editAppointment, deleteAppointment, barberServedAppointment } = require("../../controllers/Appointments/appointmentsController");
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");
const { handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");

const router = express.Router();

router.route("/createAppointment").post(createAppointment);

router.route("/editAppointments").put(verifyRefreshTokenAdmin, editAppointment)

router.route("/deleteAppointments").delete(verifyRefreshTokenAdmin, deleteAppointment)

router.route("/getEngageBarberTimeSlots").post(verifyRefreshTokenAdmin ,getEngageBarberTimeSlots)

router.route("/getAllAppointmentsBySalonId").post(verifyRefreshTokenAdmin ,getAllAppointmentsBySalonId)

router.route("/getAllAppointmentsBySalonIdAndDate").post(verifyRefreshTokenAdmin ,getAllAppointmentsBySalonIdAndDate)




router.route("/getAllAppointmentsByBarberId").post(handleBarberProtectedRoute ,getAllAppointmentsByBarberId)

router.route("/getAllAppointmentsByBarberIdAndDate").post(handleBarberProtectedRoute ,getAllAppointmentsByBarberIdAndDate)

router.route("/barberServedAppointment").post(barberServedAppointment)


module.exports = router;