const mongoose = require("mongoose")

const salonSettingsSchema  = new mongoose.Schema({
    salonId:{
        type: Number
    },
    advertisements: [
        {
            public_id: {
                type: String
            },
            url: {
                type: String,
            }
        }
    ],
    appointmentSettings:{
        appointmentStartTime:{
            type:String
        },
        appointmentEndTime:{
            type:String
        },
        // timeSlots: [{type: String}]
    }
},{timestamps: true})

const SalonSettings = mongoose.model("SalonSettings", salonSettingsSchema)

module.exports = SalonSettings