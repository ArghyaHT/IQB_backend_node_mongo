const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isoCode: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    timeZones: [
        {
            name: {
                type: String,
                required: true
            },
            abbreviation: {
                type: String,
                required: true
            },
            utcOffset: {
                type: String,
                required: true
            },
            isDaylightSaving: {
                type: Boolean,
                required: true
            }
        }
    ]
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;