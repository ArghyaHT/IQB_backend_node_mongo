const mongoose = require("mongoose")


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
    email_verified: {
        type: Boolean,
    },
    auth_time: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    userName:{
        type:String,
    },
    gender:{
        type:String,
    },

    dateOfBirth:{
        type: Date,
    },
    mobileNumber:{
        type: Number,
    },
  

    verificationCode:{
        type: String,
        // required:true
    },

    isActive: {
        type: Boolean,
        default: false
    },
  

 
  });
  
  const Admin = mongoose.model('Admin', adminSchema);
  
  module.exports = Admin;