const express = require("express");
const { getAllCountries, getAllCitiesByCountryCode } = require("../../controllers/countries/countriesController");

const router = express.Router();

router.route("/getAllCountries").post(getAllCountries)

router.route("/getAllCities").post(getAllCitiesByCountryCode)

module.exports = router;