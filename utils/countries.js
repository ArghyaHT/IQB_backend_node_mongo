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
        // Get all cities
        const cities = city.getAllCities();

        // Log each city to the console
        cities.forEach(cityData => {
            console.log(`City: ${cityData.name}, Country Code: ${cityData.countryCode}`);
        });
        
        console.log('All cities logged successfully.');
    } catch (error) {
        console.error('Error logging cities:', error);
    } 
} 

module.exports ={
    storeCountries,
    storeCities
}