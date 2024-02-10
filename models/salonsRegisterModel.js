const mongoose = require("mongoose")

const coordinatesSchema = new mongoose.Schema({
    longitude: {
        type: Number,
        // required: true,
    },
    latitude: {
        type: Number,
        // required: true,
    },
});


const salonsSchema = new mongoose.Schema({
    salonId: {
        type: Number,
    },
    salonName: {
        type: String,
        // required: true,
    },
    adminEmail: {
        type: String,
    },
    salonCode: {
        type: String,
    },
    salonLogo:
        [
            {
                public_id: {
                    type: String
                },
                url: {
                    type: String,
                }
            }
        ], 
    salonType:{
        type: String
    },
    address: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    postCode: {
        type: String,
        // required: true
    },
    contactTel: {
        type: Number,
        // required: true
    },

    webLink: {
        type: String,
        // required: true
    },
    fbLink: {
        type: String,

    },
    twitterLink: {
        type: String,
    },
    instraLink: {
        type: String,
    },
    salonEmail: {
        type: String
    },

    location: {
        type: {
            type: String,
            enum: ["Point"],
            // required: true,
        },
        coordinates: {
            type: coordinatesSchema,
            // required: true,
            index: '2dsphere'
        }

    },
    salonRatings:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalonRating'
    }],
    services: [{
        serviceId: {
            type: Number,
            // required: true,
        },
        serviceCode: {
            type: String,
            //required: true
        },
        serviceName: {
            type: String,
            // required: true,
        },
        serviceIcon: {
            public_id: {
                type: String
            },
            url: {
                type: String,
            }
        }, 
        serviceDesc: {
            type: String,
            // required: true,
        },
        servicePrice: {
            type: Number,
            // required: true
        },
        serviceEWT: {
            type: Number
        },
    }],

    isLicensed: {
        type: Boolean,
        default: false
    },
    moduleAvailability: {
        type: String,
        enum: ["Queuing", "Appointment", "Both"],
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    gallery: [
        {
            public_id: {
                type: String
            },
            url: {
                type: String,
            }
        }
    ],

}, { timestamps: true });


salonsSchema.index({ location: '2dsphere' });


const Salon = mongoose.model('Salon', salonsSchema);

module.exports = Salon;

