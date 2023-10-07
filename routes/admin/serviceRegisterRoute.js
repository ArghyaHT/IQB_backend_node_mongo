const express = require("express");
const { createService, getAllServicesBySalonId, updateBarberServicesAndServiceSupportedBarber } = require("../../controllers/admin/serviceRegisterController.js");


const router = express.Router();

router.route("/createService").post(createService)
router.route("/getAllServicesBySalonId").post(getAllServicesBySalonId)
router.route("/updateBarberAndService").post(updateBarberServicesAndServiceSupportedBarber)


module.exports = router;