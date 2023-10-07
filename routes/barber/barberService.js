const express = require("express");
const { barberServiceBybarberIdServiceId } = require("../../controllers/barber/barberService");

const router= express.Router();

router.route("/addBarberServices").post(barberServiceBybarberIdServiceId)


module.exports = router;