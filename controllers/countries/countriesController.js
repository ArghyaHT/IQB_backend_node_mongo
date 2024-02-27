const Country = require("../../models/countryModel.js");
const city = require("country-state-city").City;

//GET ALL COUNTRIES
const getAllCountries = async (req, res) => {
    try {
        const { name } = req.query;

        let query = {};
        let countries;

        // Check if query parameters exist in the request

        if (name) {
            query.name = { $regex: new RegExp('^' + name, 'i') }; // Case-insensitive search

        countries = await Country.find(query);

        }
        else if(name === undefined || name === null || name === ""){
        countries = await Country.find();
        }

        res.status(200).json({
            success: true,
            message: "Countries retrieved successfully",
            response: countries
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}

//GET ALL TIMEZONES
const getAllTimeZonesByCountry = async(req, res, next) => {
try{
const {countryCode} = req.body;
const country = await Country.findOne({countryCode});
console.log(country);
}catch (error) {
        console.error('Error fetching cities:', error);
        next(error);
    }
}

//GET ALL CITIES
const getAllCitiesByCountryCode = async (req, res, next) => {
    try {
        const { countryCode, cityName } = req.query;

        if(!countryCode){
            res.status(400).json({
                success: false,
                message: "Please choose a Country first"
            });
        }
        if(!cityName){
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

        res.status(200).json({
            success: true,
            message: "All cities retrieved successfully",
            response: retrievedCities
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        next(error);
    }
}


module.exports = {
    getAllCountries,
    getAllCitiesByCountryCode,
    getAllTimeZonesByCountry,
}