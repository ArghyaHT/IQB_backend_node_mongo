const mongoose = require("mongoose")

const barberSchema = new mongoose.Schema({
  
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
    profilePic:{
        type: String
    },
    isBarber:{
        type:Boolean,
        // default:false
    },
    isOnline:{
        type: Boolean
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
        },
        serviceEWT:{
            type: Number
        }

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

}, { timestamps: true })

const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;