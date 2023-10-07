const mongoose = require("mongoose")


const serviceSchema = new mongoose.Schema({
    salonId:{
        type: Number
    },
    services:[{
     serviceId :{
        type: Number,
        required: true,
    },
    serviceCode:{
        type: String,
        //required: true
    },
    serviceName: {
        type: String,
        // required: true,
    },
    serviceDesc: {
        type: String,
        // required: true,
    },
    servicePrice:{
        type:String,
        // required: true
    },
    supportedBarbers:[{
        barberId:{
            type:Number,
        },
        barberEmail:{
            type: String,
        }
    }]
}]
}, {timestamps: true});

const Service = mongoose.model('Service', serviceSchema);
  
module.exports = Service;