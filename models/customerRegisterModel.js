const mongoose = require("mongoose")

const jwt = require("jsonwebtoken")


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

    VerificationCode:{
        type: String,
        // required:true
    },

    tokens: [{
        token:{
            type: String,
            required : true
        }
    }]
  });
  
customerSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id: this._id.toString()}, "thisiismynewjsonwebtokencreationiamdoing");
        this.tokens = this.tokens.concat({token: token})

        await this.save()
    }
    catch(error){
        console.log(error)
    }
}

  const Customer = mongoose.model('Customer', customerSchema);
  
  module.exports = Customer;