const mongoose = require("mongoose")


const adminSchema = new mongoose.Schema({
    SalonId:{
        type: String
    },
    Email:{
        type: String,
        required: true
    },

    FirstName:{
        type:String,
        required: true
    },

    LastName:{
        type: String,
        required: true
    },
    UserName:{
        type:String,
        required: true
    },
    Gender:{
        type:String,
        required: true
    },

    DateOfBirth:{
        type: Date,
        required:true
    },
    MobileNumber:{
        type: Number,
        required: true,
    },
    Password:{
        type: String,
        required: true
    },

    VerificationCode:{
        type: String,
        // required:true
    },

 
  });
  
  const Admin = mongoose.model('Admin', adminSchema);
  
  module.exports = Admin;