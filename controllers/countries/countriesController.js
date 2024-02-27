const Country = require("../../models/countryModel.js");
const city = require("country-state-city").City;

//GET ALL COUNTRIES
const getAllCountries = async (req, res) => {
    try {
        const { name, page = 1, limit = 10, } = req.query;

        let query = {};

        // Check if query parameters exist in the request

        if (name) {
            query.name = { $regex: new RegExp('^' + name, 'i') }; // Case-insensitive search
        }
        // Add more conditions for other query parameters as needed

        const skip = Number(page - 1) * Number(limit);

        const countries = await Country.find(query).skip(skip).limit(Number(limit));
        const totalCountries = await Country.countDocuments(query);

        res.status(200).json({
            success: true,
            message: "Countries retrieved successfully",
            response: {
                countries,
                totalPages: Math.ceil(totalCountries / Number(limit)),
                currentPage: Number(page),
                totalCountries: totalCountries
            }
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
        const { countryCode, cityName, page = 1, limit = 20 } = req.query;

        let query = {};
        const cities = city.getAllCities().filter(city => city.countryCode === countryCode);

        let retrievedCities;

        if (cityName) {
            const searchRegExpCityName = new RegExp('^' + cityName + ".*", 'i');
            query.name = { $regex: searchRegExpCityName };

            // Filter city names according to the regex query
            retrievedCities = cities.filter(city => searchRegExpCityName.test(city.name));
        } else {
            // If no city name is provided, send all city names
            retrievedCities = cities;
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedCities = retrievedCities.slice(skip, skip + Number(limit));

        const totalCities = retrievedCities.length;

        res.status(200).json({
            success: true,
            message: "All cities retrieved successfully",
            response: {
                retrievedCities: paginatedCities,
                totalPages: Math.ceil(totalCities / Number(limit)),
                currentPage: Number(page),
                totalCities: totalCities
            }
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