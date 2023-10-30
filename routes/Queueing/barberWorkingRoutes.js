const express = require("express");

const { isBarberOnline } = require("../../controllers/Queueing/barberWorkingController");

const router = express.Router();

router.route("/changeBarberOnlineStatus").put(isBarberOnline)


module.exports = router;