const express = require("express");
const { createSalonSettings, getSalonSettings, updateSalonSettings, deleteSalonSettings } = require("../../controllers/salonSettings/salonSettingsController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router =  express.Router();

//Create Salon Settings
router.route("/createSalonSettings").post(handleProtectedRoute,createSalonSettings)

//Get Salon Settings
router.route("/getSalonSettings").post(handleProtectedRoute, getSalonSettings)

//Update Salon Settings
router.route("/updateSalonSettings").put(handleProtectedRoute, updateSalonSettings)

router.route("/deleteSalonSettings").delete(deleteSalonSettings)



module.exports = router;