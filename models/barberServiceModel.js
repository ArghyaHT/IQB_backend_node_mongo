const mongoose = require("mongoose")

const barberServiceSchema = new mongoose.Schema({
    BarberId:{
        type: Number
    },
    SalonId:{
        type: Number
    },
    BarberServices:[{
        ServiceId: {
            type: String,
        },
        ServiceCode:{
            type: String
        },
        ServiceName: {
            type: String,
            required: true,
        },
        ServiceDescription: {
            type: String,
            required: true,
        },
        }]  
})

const BarberService = mongoose.model("BarberService", barberServiceSchema)
module.exports = BarberService