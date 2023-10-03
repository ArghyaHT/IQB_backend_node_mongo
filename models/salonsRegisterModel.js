const mongoose = require("mongoose")

const serviceSchema = new mongoose.Schema({
    ServiceId :{
        type: String,
    },
    ServiceName: {
        type: String,
        required: true,
    },
    ServiceDescription: {
        type: String,
        required: true,
    },
   
});

const salonsSchema = new mongoose.Schema({
    SalonId:{
        type: Number,
    },
    UserName:{
        type: String,
        required:true
    },
    SalonName:{
        type:String,
        required: true,
    },
    AdminEmail:{
        type:String,
    },
    SalonCode:{
        type: String,
    },
    SalonAppIcon:{
        type:String,
        // required: true
    },
    SalonLogo:{
        type:String,
        // required: true
    },
    Address:{
        type:String,
        required: true
    },
    City:{
        type:String,
        required: true
    },
    Country:{
        type:String,
        required:true
    },
    PostCode:{
        type:String,
        required:true
    },
    ContactTel:{
        type:Number,
        required:true
    },

    SalonWebsite:{
        type:String,
        required:true
    },
    SalonFacebook:{
        type:String,
        
    },
    SalonTwitter:{
        type:String,
    },
    SalonInstagram:{
        type:String,
    },

    SalonServices: [serviceSchema], 

    RegisteredBarber:[{
        BarberId:{
            type:Number,
        },
        BarberEmail:{
            type: String,
        }
    }]
});
const Salon = mongoose.model('Salon', salonsSchema);
  
module.exports = Salon;

