const mongoose = require("mongoose")

const barberSchema = new mongoose.Schema({
  

    //    firstName:{
    //         type:String,
    //         // required: true
    //     },

    //     lastName:{
    //         type: String,
    //         // required: true
    //     },
    name: {
        type: String,
        // required:true
    },
    email: {
        type: String,
        // required: true
    },
    userName: {
        type: String,
        // required: true,
    },

    mobileNumber: {
        type: Number,
        // required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    salonId: {
        type: Number
    },
    barberId: {
        type: Number
    },
    barberCode: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    },
    email_verified: {
        type: Boolean,
        // required: true
    },
    auth_time: {
        type: String,
        // required: true
    },
    // isAdmin: {
    //     type: Boolean,
    //     default: false
    // },
    isBarber:{
        type:Boolean,
        default:false
    },
    barberServices: [{
        serviceId: {
            type: Number
        },
        serviceCode: {
            type: String
        },
        serviceName: {
            type: String
        }

    }]

}, { timestamps: true })

const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;