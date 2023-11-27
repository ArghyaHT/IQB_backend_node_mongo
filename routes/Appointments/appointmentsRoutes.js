const express =  require("express");
const { createAppointment, getAllAppointmentsByBarberId, getEngageBarberTimeSlots } = require("../../controllers/Appointments/appointmentsController");

const router = express.Router();

router.route("/createAppointment").post(createAppointment);
router.route("/getAllAppointmentsByBarberId").get(getAllAppointmentsByBarberId)
router.route("/getEngageBarberTimeSlots").post(getEngageBarberTimeSlots)


module.exports = router;