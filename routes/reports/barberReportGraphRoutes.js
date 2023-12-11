const express = require("express");
const { customerServedByEachBarber } = require("../../controllers/reports/barberReportGraphController");
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");

const router = express.Router();

router.route("/customerServedGraph").get(handleProtectedRoute,customerServedByEachBarber)

module.exports = router