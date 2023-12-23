const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements } = require("../../controllers/Dashboard/dashboardController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(handleProtectedRoute, addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(handleProtectedRoute,getAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(handleProtectedRoute,getDashboardAppointmentList)


module.exports = router; 