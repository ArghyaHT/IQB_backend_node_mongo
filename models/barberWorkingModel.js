const mongoose = require("mongoose");

const barebrWorkingSchema = new mongoose.Schema({
    salonId: {
        type: Number
    },
    barberWorking: [{
        barberId: {
            type: Number
        },
        position:{
            type: Number
        },
        barberName:{
            type: String
        },
        serviceId:[{
            type:Number
        }],
        barberEWT:{
            type: Number,
            default: 0,
        },
        queueCount:{
            type: Number
        },
        isOnline:{
            type: Boolean
        },
    }]
   

}, {timestamps:true})

const BarberWorking = mongoose.model("BarberWorking", barebrWorkingSchema)
module.exports = BarberWorking

