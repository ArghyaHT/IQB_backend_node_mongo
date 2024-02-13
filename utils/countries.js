const csc = require("country-state-city").Country;
// const Country = require('./models/Country');

async function storeCountries() {
    try {

        // Get all countries
        const countries = csc.getAllCountries();

        console.log(countries)

        // // Store each country in the database
        // for (const country of countries) {
        //     // Create a new Country document based on your model
        //     const newCountry = new Country({
        //         country_id: country.id,
        //         name: country.name,
        //         iso2: country.iso2,
        //         iso3: country.iso3,
        //         phone_code: country.phone_code
        //     });

        //     // Save the country document to the database
        //     await newCountry.save();
        // }

        // console.log('Countries stored successfully.');
    } catch (error) {
        console.error('Error storing countries:', error);
    } 
}

module.exports ={
    storeCountries
}