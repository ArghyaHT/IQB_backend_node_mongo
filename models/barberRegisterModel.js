const mongoose = require("mongoose")

const barberSchema = new mongoose.Schema({
    Email:{
        type: String,
        required: true
    },

    FirstName:{
        type:String,
        required: true
    },

    LastName:{
        type: String,
        required: true
    },

    UserName:{
        type: String,
        required: true,
    },

    MobileNumber:{
        type: Number,
        required: true,
    },
    DateOfBirth:{
        type: Date,
    },
    SalonId:{
        type:Number
    },
    BarberId:{
        type:Number
    },
    BarberCode:{
        type:String
    },
    IsActive:{
        type:Boolean
    },
   
})

const Barber = mongoose.model('Barber', barberSchema);
  
module.exports = Barber;