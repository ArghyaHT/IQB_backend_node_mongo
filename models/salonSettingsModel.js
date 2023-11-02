const mongoose = require("mongoose")

const salonSettingsSchema  = new mongoose.Schema({
    salonId:{
        type: Number
    },
    queueSettings:{
        settings1:{
            type:String
        },
        settings2:{
            type: String
        },
        settings3:{
            type: String
        }
    },
    appointmentSettings:{
        appSettings1:{
            type:String
        },
        appSettings:{
            type:String
        },
        appSettings3: {
            type:String
        }
    }
},{timestamps: true})

const SalonSettings = mongoose.model("SalonSettings", salonSettingsSchema)

module.exports = SalonSettings