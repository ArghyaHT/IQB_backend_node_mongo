const express = require("express");
const { customerReports } = require("../../controllers/reports/customerReportGraphController");

const router = express.Router();

router.route("/customersGraph").get(customerReports)

module.exports = router 