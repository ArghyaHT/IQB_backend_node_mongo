const mongoose = require("mongoose")

const barberServiceSchema = new mongoose.Schema({
    barberId:{
        type: Number
    },
    salonId:{
        type: Number
    },
    barberServices:[{
        serviceId: {
            type: String,
        },
        serviceCode:{
            type: String
        },
        serviceName: {
            type: String,
            required: true,
        },
        serviceEWT: {
            type: Number,
            
        }

        }]  
})

const BarberService = mongoose.model("BarberService", barberServiceSchema)
module.exports = BarberService