const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots, getAllAppointmentsBySalonId, getAllAppointmentsBySalonIdAndDate } = require("../../controllers/Appointments/appointmentsController");

const router = express.Router();

router.route("/createAppointment").post(createAppointment);
router.route("/getAllAppointmentsByBarberId").get(getAllAppointmentsByBarberId)
router.route("/getEngageBarberTimeSlots").post(getEngageBarberTimeSlots)
router.route("/getAllAppointmentsBySalonId").post(getAllAppointmentsBySalonId)
router.route("/getAllAppointmentsBySalonIdAndDate").post(getAllAppointmentsBySalonIdAndDate)


module.exports = router;