const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements } = require("../../controllers/Dashboard/dashboardController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(getAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(getDashboardAppointmentList)


module.exports = router; 