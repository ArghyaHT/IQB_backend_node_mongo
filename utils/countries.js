const Country = require("../models/countryModel");

const csc = require("country-state-city").Country;
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
                isoCode: country.isoCode, // Assuming iso2 is used for isoCode
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

module.exports ={
    storeCountries
}