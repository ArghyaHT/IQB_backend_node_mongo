const mongoose = require("mongoose")

const barberSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },

   firstName:{
        type:String,
        required: true
    },

    lastName:{
        type: String,
        required: true
    },

    userName:{
        type: String,
        required: true,
    },

    mobileNumber:{
        type: Number,
        required: true,
    },
    dateOfBirth:{
        type: Date,
    },
    salonId:{
        type:Number
    },
    barberId:{
        type:Number
    },
    barberCode:{
        type:String
    },
    isActive:{
        type:Boolean
    },
    barberServices:[{
        serviceId:{
            type: Number
        },
        serviceName:{
            type:String
        } 

    }]
   
}, {timestamps: true})

const Barber = mongoose.model('Barber', barberSchema);
  
module.exports = Barber;