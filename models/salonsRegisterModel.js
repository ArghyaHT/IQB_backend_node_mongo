const mongoose = require("mongoose")

const coordinatesSchema = new mongoose.Schema({
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
});

const salonsSchema = new mongoose.Schema({
    salonId: {
        type: Number,
    },
    userName: {
        type: String,
        required: true
    },
    salonName: {
        type: String,
        required: true,
    },
    adminEmail: {
        type: String,
    },
    salonCode: {
        type: String,
    },
    salonIcon: {
        type: String,
        // required: true
    },
    salonLogo: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postCode: {
        type: String,
        required: true
    },
    contactTel: {
        type: Number,
        required: true
    },

    webLink: {
        type: String,
        required: true
    },
    fbLink: {
        type: String,

    },
    twitterlink: {
        type: String,
    },
    instraLink: {
        type: String,
    },


    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: coordinatesSchema,
            required: true,
            index: '2dsphere'
        }

    },
    services: [{
        serviceId: {
            type: Number,
            required: true,
        },
        serviceCode: {
            type: String,
            //required: true
        },
        serviceName: {
            type: String,
            // required: true,
        },
        serviceDesc: {
            type: String,
            // required: true,
        },
        servicePrice: {
            type: String,
            // required: true
        },
        supportedBarbers: [{
            barberId: {
                type: Number,
            },
            barberEmail: {
                type: String,
            }
        }]
    }],

    isLicensed: {
        type: Boolean,
        default: false
    },
    moduleAvailability: {
        type: String,
        enum: ["Queuing", "Appointment", "Both"],
    },
    registeredBarber: [{
        barberId: {
            type: Number,
        },
        barberEmail: {
            type: String,
        }
    }]
}, { timestamps: true });


salonsSchema.index({ location: '2dsphere' });


const Salon = mongoose.model('Salon', salonsSchema);

module.exports = Salon;

