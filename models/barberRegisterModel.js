const mongoose = require("mongoose")
const crypto = require("crypto")

const barberSchema = new mongoose.Schema({
  
    name: {
        type: String,
        // required:true
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    barber: {
        type: String,
        default: false
    },
    AuthType: {
        type: String,
        default: "local"
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
    isApproved:{
        type: Boolean,
        default: false
    },
    profilePic:{
        type: String
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
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true })


//Generating Password Reset Token
barberSchema.methods.getResetPasswordToken = function () {

    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex")

    //Hashing and adding resetPasswordtoken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    //We return this because when user click then this resetPasswordToken will form .so thast why 
    return resetToken
}
const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;