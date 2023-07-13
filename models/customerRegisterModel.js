const mongoose = require("mongoose")


const customerSchema = new mongoose.Schema({
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

    ReEnterPassword:{
        type: String,
        // required: true
    },

    VerificationCode:{
        type: String,
        // required:true
    },

    CustomerType: {
        type: String,
        enum: ["Admin", "Barber", "Customer"],
        required: true
    }
  });
  
  const Customer = mongoose.model('Customer', customerSchema);
  
  module.exports = Customer;