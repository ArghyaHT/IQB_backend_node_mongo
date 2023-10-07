const mongoose = require("mongoose")

const salonsSchema = new mongoose.Schema({
    salonId:{
        type: Number,
    },
    userName:{
        type: String,
        required:true
    },
    salonName:{
        type:String,
        required: true,
    },
    adminEmail:{
        type:String,
    },
    salonCode:{
        type: String,
    },
    salonIcon:{
        type:String,
        // required: true
    },
    salonLogo:{
        type:String,
        // required: true
    },
    address:{
        type:String,
        required: true
    },
    city:{
        type:String,
        required: true
    },
    country:{
        type:String,
        required:true
    },
    postCode:{
        type:String,
        required:true
    },
    contactTel:{
        type:Number,
        required:true
    },

    webLink:{
        type:String,
        required:true
    },
    fbLink:{
        type:String,
        
    },
    twitterlink:{
        type:String,
    },
    instraLink:{
        type:String,
    },
    longitude:{
        type:String
    },
    latitude:{
        type:String
    },
    isLicensed:{
        type: Boolean,
        default: false
    },
    moduleAvailability: {
        type: String,
        enum: ["Queuing", "Appointment", "Both"],
    },
    registeredBarber:[{
        barberId:{
            type:Number,
        },
        barberEmail:{
            type: String,
        }
    }]
},{timestamps: true});
const Salon = mongoose.model('Salon', salonsSchema);
  
module.exports = Salon;

