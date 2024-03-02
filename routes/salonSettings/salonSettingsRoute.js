const express = require("express");
const { createSalonSettings, getSalonSettings, updateSalonSettings, deleteSalonSettings } = require("../../controllers/salonSettings/salonSettingsController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");

const router =  express.Router();

//Create Salon Settings
router.route("/createSalonSettings").post(verifyRefreshTokenAdmin,createSalonSettings)

//Get Salon Settings
router.route("/getSalonSettings").post(verifyRefreshTokenAdmin, getSalonSettings)

//Update Salon Settings
router.route("/updateSalonSettings").put(verifyRefreshTokenAdmin, updateSalonSettings)

router.route("/deleteSalonSettings").delete(deleteSalonSettings)



module.exports = router;