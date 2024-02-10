const express = require("express");
const { createSalonSettings, getSalonSettings, updateSalonSettings, deleteSalonSettings } = require("../../controllers/salonSettings/salonSettingsController");
const { handleProtectedRoute, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router =  express.Router();

//Create Salon Settings
router.route("/createSalonSettings").post(handleAdminProtectedRoute,createSalonSettings)

//Get Salon Settings
router.route("/getSalonSettings").post(handleAdminProtectedRoute, getSalonSettings)

//Update Salon Settings
router.route("/updateSalonSettings").put(handleAdminProtectedRoute, updateSalonSettings)

router.route("/deleteSalonSettings").delete(deleteSalonSettings)



module.exports = router;