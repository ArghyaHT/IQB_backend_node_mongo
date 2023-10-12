const mongoose = require("mongoose")

const jwt = require("jsonwebtoken")


const customerSchema = new mongoose.Schema({

    salonId:{
        type: Number
    },
    customerId:{
        type: Number
    },
    email:{
        type: String,
        required: true
    },

    firstName:{
        type:String,
        required: true
    },

    lastName:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
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
    password:{
        type: String,
        required: true
    },

    verificationCode:{
        type: String,
        // required:true
    },
    profilePic:{
        type: String
    }

//     tokens: [{
//         token:{
//             type: String,
//             required : true
//         }
//     }]
//   });
  
// customerSchema.methods.generateAuthToken = async function(){
//     try{
//         const token = jwt.sign({_id: this._id.toString()}, "thisiismynewjsonwebtokencreationiamdoing");
//         this.tokens = this.tokens.concat({token: token})

//         await this.save()
//     }
//     catch(error){
//         console.log(error)
//     }
})

  const Customer = mongoose.model('Customer', customerSchema);
  
  module.exports = Customer;