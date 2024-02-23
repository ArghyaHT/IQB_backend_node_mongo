const express = require("express");
const { getAllCountries, getAllCitiesByCountryCode } = require("../../controllers/countries/countriesController");

const router = express.Router();

router.route("/getAllCountries").get(getAllCountries)

router.route("/getAllCities").post(getAllCitiesByCountryCode)

module.exports = router;