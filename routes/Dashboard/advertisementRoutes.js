const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements, updateAdvertisements, deleteAdvertisements } = require("../../controllers/Dashboard/dashboardController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(verifyRefreshTokenAdmin, addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(verifyRefreshTokenAdmin,getAdvertisements)

//Update Advertisements
router.route("/updateAdvertisements").put(verifyRefreshTokenAdmin, updateAdvertisements)

//Delete Advertisements
router.route("/deleteAdvertisements").delete(verifyRefreshTokenAdmin, deleteAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(verifyRefreshTokenAdmin,getDashboardAppointmentList)


module.exports = router; 