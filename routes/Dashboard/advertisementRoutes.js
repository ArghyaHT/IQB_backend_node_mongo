const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements, updateAdvertisements } = require("../../controllers/Dashboard/dashboardController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(handleProtectedRoute, addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(handleProtectedRoute,getAdvertisements)

//Update Advertisements
router.route("/updateAdvertisements").put(updateAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(handleProtectedRoute,getDashboardAppointmentList)


module.exports = router; 