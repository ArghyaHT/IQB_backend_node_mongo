const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate, getAllAppointmentsByBarberIdAndDate, editAppointment, deleteAppointment, barberServedAppointment } = require("../../controllers/Appointments/appointmentsController");
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");
const { handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController");

const router = express.Router();

router.route("/createAppointment").post(createAppointment);

router.route("/editAppointments").put(handleAdminProtectedRoute, editAppointment)

router.route("/deleteAppointments").delete(handleAdminProtectedRoute, deleteAppointment)

router.route("/getEngageBarberTimeSlots").post(handleAdminProtectedRoute ,getEngageBarberTimeSlots)

router.route("/getAllAppointmentsBySalonId").post(handleAdminProtectedRoute ,getAllAppointmentsBySalonId)

router.route("/getAllAppointmentsBySalonIdAndDate").post(handleAdminProtectedRoute ,getAllAppointmentsBySalonIdAndDate)




router.route("/getAllAppointmentsByBarberId").post(handleBarberProtectedRoute ,getAllAppointmentsByBarberId)

router.route("/getAllAppointmentsByBarberIdAndDate").post(handleBarberProtectedRoute ,getAllAppointmentsByBarberIdAndDate)

router.route("/barberServedAppointment").post(barberServedAppointment)


module.exports = router;