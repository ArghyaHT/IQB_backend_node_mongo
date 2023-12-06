const mongoose = require("mongoose")

const jwt = require("jsonwebtoken")


const customerSchema = new mongoose.Schema({

    salonId:{
        type: Number
    },
    customerId:{
        type: Number
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    customer: {
        type: String,
        default: false
    },
    AuthType: {
        type: String,
        default: "local"
    },
    name:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        // required: true
    },
    gender:{
        type:String,
        required: true
    },

    dateOfBirth:{
        type: Date,
        required:true
    },
    mobileNumber:{
        type: Number,
        required: true,
    },
    verificationCode:{
        type: String,
        // required:true
    },
    profilePic:{
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {timestamps: true})
customerSchema.methods.getResetPasswordToken = function () {

    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex")

    //Hashing and adding resetPasswordtoken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    console.log('Reset Token:', resetToken);
    //We return this because when user click then this resetPasswordToken will form .so thast why 
    return resetToken
    
}
  const Customer = mongoose.model('Customer', customerSchema);
  
  module.exports = Customer;