const mongoose = require("mongoose");

const barebrWorkingSchema = new mongoose.Schema({
    salonId: {
        type: Number
    },
    barberWorking: [{
        barberId: {
            type: Number
        },
        //unused
        position:{
            type: Number
        },
        barberName:{
            type: String
        },
        //inside the array put ewt of every service as that will be barber specific
        serviceId:[{
            type:Number
        }],
        // total time waiting
        barberEWT:{
            type: Number,
            default: 0,
        },
        //populate this field with the count 
        queueCount:{
            type: Number, 
            default: 0
        },
        isOnline:{
            type: Boolean
        },
    }]
   

}, {timestamps:true})

const BarberWorking = mongoose.model("BarberWorking", barebrWorkingSchema)
module.exports = BarberWorking

