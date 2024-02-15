const City = require("../models/cityModel");
const Country = require("../models/countryModel");

const csc = require("country-state-city").Country;

const city = require("country-state-city").City; 
// const Country = require('./models/Country');

async function storeCountries() {
    try {
        // Get all countries
        const countries = csc.getAllCountries();

        // Store each country in the database
        for (const country of countries) {
            console.log(countries)
            const newCountry = new Country({
                name: country.name,
                countryCode: country.isoCode, // Assuming iso2 is used for isoCode
                currency: country.currency, // You may need to retrieve currency information from another source
                timeZones: country.timezones.map(timezone => ({
                    zoneName: timezone.zoneName,
                    gmtOffset: timezone.gmtOffset,
                    gmtOffsetName: timezone.gmtOffsetName,
                    abbreviation: timezone.abbreviation,
                    tzName: timezone.tzName,
                }))
            });

            // Save the country document to the database
            await newCountry.save();
        }

        console.log('Countries stored successfully.');
    } catch (error) {
        console.error('Error storing countries:', error);
    } 
} 


async function storeCities() {
    try {
        // Get all countries
        const cities = city.getAllCities();

        console.log(cities)

        // Store each country in the database
        for (const city of cities) {
            console.log(cities)
            const newCity = new City({
                name: city.name,
                countryCode: city.countryCode
            });

            // Save the country document to the database
            await newCity.save();
        }
    } catch (error) {
        console.error('Error storing countries:', error);
    } 
} 

module.exports ={
    storeCountries,
    storeCities
}