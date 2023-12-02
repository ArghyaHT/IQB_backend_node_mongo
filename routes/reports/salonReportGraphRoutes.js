const express = require("express");
const { salonReports } = require("../../controllers/reports/salonReportGraphController");


const router = express.Router();

router.route("/salonReportsGraph").get(salonReports)

module.exports = router