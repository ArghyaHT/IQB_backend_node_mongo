const express = require("express");
const { createSalonSettings, getSalonSettings, updateSalonSettings, deleteSalonSettings } = require("../../controllers/salonSettings/salonSettingsController");

const router =  express.Router();

router.route("/createSalonSettings").post(createSalonSettings)
router.route("/getSalonSettings").get(getSalonSettings)
router.route("/updateSalonSettings").put(updateSalonSettings)
router.route("/deleteSalonSettings").delete(deleteSalonSettings)


module.exports = router;