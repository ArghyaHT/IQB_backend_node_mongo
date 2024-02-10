const express = require("express");
const { addAdvertisements, getDashboardAppointmentList, getAdvertisements, updateAdvertisements, deleteAdvertisements } = require("../../controllers/Dashboard/dashboardController");
const { handleProtectedRoute, isLogginMiddleware, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

//Add Advertisements
router.route("/addAdvertisements").post(handleAdminProtectedRoute, addAdvertisements)

//Get Advertisements
router.route("/getAdvertisements").post(handleAdminProtectedRoute,getAdvertisements)

//Update Advertisements
router.route("/updateAdvertisements").put(handleAdminProtectedRoute, updateAdvertisements)

//Delete Advertisements
router.route("/deleteAdvertisements").delete(handleAdminProtectedRoute, deleteAdvertisements)

//Get DashboardQlist
router.route("/getDashboardAppointmentList").post(handleAdminProtectedRoute,getDashboardAppointmentList)


module.exports = router; 