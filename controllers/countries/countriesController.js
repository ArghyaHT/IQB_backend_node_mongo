const Country = require("../../models/countryModel.js");
const city = require("country-state-city").City;

//GET ALL COUNTRIES
const getAllCountries = async (req, res) => {
    try {
        const  {name} = req.query;

        let query = {};

        // Check if query parameters exist in the request

            if (name) {
                 query.name = { $regex: new RegExp('^' + name, 'i') }; // Case-insensitive search
            }
            // Add more conditions for other query parameters as needed
        

        const countries = await Country.find(query);

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

//GET ALL CITIES
const getAllCitiesByCountryCode = async (req, res, next) => {
    try {
        const {countryCode, cityName} = req.query

        let query = {};

            // Assuming city.getAllCities() returns an array of cities
            const cities = city.getAllCities().filter(city => city.countryCode === countryCode);

            let retrievedCities;

            if (cityName) {
                const searchRegExpCityName = new RegExp('^' + cityName + ".*", 'i');
                query.name = { $regex: searchRegExpCityName };
                
                // Filter city names according to the regex query
                retrievedCities = cities
                    .filter(city => searchRegExpCityName.test(city.name))
            } else {
                // If no city name is provided, send all city names
                retrievedCities = cities;
            }

        res.status(200).json({
            success: true,
            message: "All cities retrieved successfully",
            response: retrievedCities // Extract city names
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        next(error);
    }
}


module.exports = {
    getAllCountries,
    getAllCitiesByCountryCode,

}