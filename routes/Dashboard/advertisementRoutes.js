const express = require("express");
const { addAdvertisements, getDashboardQList } = require("../../controllers/Dashboard/dashboardController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(addAdvertisements)

//Get DashboardQlist
router.route("/getQListBySalonId").post(getDashboardQList)


module.exports = router; 