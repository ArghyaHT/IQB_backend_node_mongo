const express = require("express");
const { addAdvertisements, getDashboardAppointmentList } = require("../../controllers/Dashboard/dashboardController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(addAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(getDashboardAppointmentList)


module.exports = router; 