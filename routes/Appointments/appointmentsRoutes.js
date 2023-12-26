const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate, getAllAppointmentsByBarberIdAndDate, editAppointment, deleteAppointment } = require("../../controllers/Appointments/appointmentsController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

router.route("/createAppointment").post(handleProtectedRoute, createAppointment);

router.route("/editAppointments").put(handleProtectedRoute, editAppointment)

router.route("/deleteAppointments").delete(handleProtectedRoute, deleteAppointment)

router.route("/getEngageBarberTimeSlots").post(handleProtectedRoute ,getEngageBarberTimeSlots)

router.route("/getAllAppointmentsBySalonId").post(handleProtectedRoute ,getAllAppointmentsBySalonId)

router.route("/getAllAppointmentsBySalonIdAndDate").post(handleProtectedRoute ,getAllAppointmentsBySalonIdAndDate)

router.route("/getAllAppointmentsByBarberId").post(handleProtectedRoute ,getAllAppointmentsByBarberId)

router.route("/getAllAppointmentsByBarberIdAndDate").post(handleProtectedRoute ,getAllAppointmentsByBarberIdAndDate)


module.exports = router;