const mongoose = require("mongoose")

const crypto = require("crypto")


const adminSchema = new mongoose.Schema({
    salonId:{
        type: String
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    admin: {
        type: String,
        default: false
    },
    AuthType: {
        type: String,
        default: "local"
    },
    userName:{
        type:String,
    },
    gender:{
        type:String,
    },

    profilePic:{
        type:String
    },

    dateOfBirth:{
        type: Date,
    },
    mobileNumber:{
        type: Number,
    },

    isActive: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },{ timestamps: true });
  //Generating Password Reset Token
adminSchema.methods.getResetPasswordToken = function () {

    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex")

    //Hashing and adding resetPasswordtoken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    //We return this because when user click then this resetPasswordToken will form .so thast why 
    return resetToken
}
  const Admin = mongoose.model('Admin', adminSchema);
  
  module.exports = Admin;