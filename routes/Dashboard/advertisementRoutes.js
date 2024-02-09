const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements, updateAdvertisements, deleteAdvertisements } = require("../../controllers/Dashboard/dashboardController");
const { handleProtectedRoute, isLogginMiddleware } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(handleProtectedRoute,isLogginMiddleware, addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(handleProtectedRoute,getAdvertisements)

//Update Advertisements
router.route("/updateAdvertisements").put(updateAdvertisements)

//Delete Advertisements
router.route("/deleteAdvertisements").delete(handleProtectedRoute, deleteAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(handleProtectedRoute,getDashboardAppointmentList)


module.exports = router; 