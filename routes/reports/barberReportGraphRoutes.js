const express = require("express");
const { customerServedByEachBarber } = require("../../controllers/reports/barberReportGraphController");

const router = express.Router();

router.route("/customerServedGraph").get(customerServedByEachBarber)

module.exports = router