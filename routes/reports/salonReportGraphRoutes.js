const express = require("express");
const { salonReports } = require("../../controllers/reports/salonReportGraphController");


const router = express.Router();

router.route("/salonReportsGraph").post(salonReports)

module.exports = router