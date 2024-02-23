const Country = require("../../models/countryModel.js");
const city = require("country-state-city").City;

const getAllCountries = async (req, res) => {
    try {
        const countries = await Country.find({});

        res.status(200).json({
            success: true,
            message: "All Countries Retrieved successfully",
            response: countries
        })
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}

const getAllCitiesByCountryCode = async (req, res, next) => {
    try {
        const {countryCode} = req.body
        // Assuming city.getAllCities() returns an array of cities
        const cities = city.getAllCities().filter(city => city.countryCode === countryCode);
        
      const retrievedCities =cities.map(city => city.name)

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