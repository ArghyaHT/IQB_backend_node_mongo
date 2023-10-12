const express = require("express");
const {   getBarberServicesByBarberId, deletebarberServiceBybarberIdServiceId, barberServiceBybarberIdServiceId } = require("../../controllers/barber/barberService");

const router= express.Router();

router.route("/addBarberServices").post(barberServiceBybarberIdServiceId)
router.route("/getBarberServicesByBarberId").post(getBarberServicesByBarberId)
router.route("/deleteBarberServiceBybarberId").delete(deletebarberServiceBybarberIdServiceId)
// Update service by 

module.exports = router;