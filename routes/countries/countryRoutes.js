const express = require("express");
const { getAllCountries, getAllCitiesByCountryCode, getAllTimeZonesByCountry } = require("../../controllers/countries/countriesController");

const router = express.Router();

router.route("/getAllCountries").post(getAllCountries)

router.route("/getAllCities").post(getAllCitiesByCountryCode)

router.route("/getAllTimeZones").post(getAllTimeZonesByCountry)

module.exports = router;