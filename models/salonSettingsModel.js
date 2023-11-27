const mongoose = require("mongoose")

const salonSettingsSchema  = new mongoose.Schema({
    salonId:{
        type: Number
    },
    // queueSettings:{
    //     settings1:{
    //         type:String
    //     },
    //     settings2:{
    //         type: String
    //     },
    //     settings3:{
    //         type: String
    //     }
    // },
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