const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isoCode: {
        type: String,
    },
    currency: {
        type: String,
    },
    timeZones: [
        {
            zoneName: {
                type: String,
            },
            gmtOffset: {
                type: Number,
            },
            gmtOffsetName: {
                type: String,
            },
            abbreviation:{
                type: String
            }, 
            tzName:{
                type: String
            }
        }
    ]
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;