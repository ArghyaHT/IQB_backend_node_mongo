const Country = require("../../models/countryModel.js");
const city = require("country-state-city").City;

//GET ALL COUNTRIES
const getAllCountries = async (req, res, next) => {
    try {
        const { name } = req.query;

        let query = {};
        let countries;

        // Check if query parameters exist in the request
        if (name === undefined || name === null || name === "" || name === "undefined" || name === "null") {
            countries = await Country.find();
        }
        else {
            query.name = { $regex: new RegExp('^' + name, 'i') }; // Case-insensitive search

            countries = await Country.find(query);
        }
        if (countries.length === 0) {
            res.status(201).json({
                success: false,
                message: "No countries found",
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: "Countries retrieved successfully",
                response: countries
            });
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}

//GET ALL TIMEZONES
const getAllTimeZonesByCountry = async (req, res, next) => {
    try {
        const { countryCode } = req.query;
        if (!countryCode) {
            res.status(400).json({
                success: false,
                message: "Please choose a Country first"
            });
        }
        const country = await Country.findOne({ countryCode });

        // Extract timeZones array from the country
        const timeZones = country.timeZones;
        // Extract unique gmtOffsetName values using Set
        const uniqueGmtOffsetNames = new Set(timeZones.map(zone => zone.gmtOffsetName));


        res.status(200).json({
            success: true,
            message: "Time zones retrieved successfully",
            response: Array.from(uniqueGmtOffsetNames)
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
}

//GET ALL CITIES
const getAllCitiesByCountryCode = async (req, res, next) => {
    try {
        const { countryCode, cityName } = req.query;

        if (!countryCode) {
            res.status(400).json({
                success: false,
                message: "Please choose a Country first"
            });
        }
        if (!cityName) {
            res.status(400).json({
                success: false,
                message: "Please enter the City name"
            });
        }

        let query = {};
        const cities = city.getAllCities().filter(city => city.countryCode === countryCode);

        let retrievedCities;

        if (cityName) {
            const searchRegExpCityName = new RegExp('^' + cityName + ".*", 'i');
            query.name = { $regex: searchRegExpCityName };

            // Filter city names according to the regex query
            retrievedCities = cities.filter(city => searchRegExpCityName.test(city.name));
        }
        if (retrievedCities.length === 0) {
            res.status(201).json({
                success: false,
                message: "No cities found",
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: "All cities retrieved successfully",
                response: retrievedCities
            });
        }
    }  catch (error) {
        console.log(error);
        next(error);
    }
}


module.exports = {
    getAllCountries,
    getAllCitiesByCountryCode,
    getAllTimeZonesByCountry,
}