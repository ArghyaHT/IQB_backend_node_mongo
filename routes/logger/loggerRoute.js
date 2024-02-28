const express = require("express");
const { downloadLogger } = require("../../controllers/logger/loggerController.js");

const router = express.Router();

router.route("/download-logger").get(downloadLogger)

module.exports = router;