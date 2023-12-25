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
    emailVerified:{
        type: Boolean,
        default: false
    },
    verificationCode:{
        type: String,
        // required:true
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
    nickName: {
        type: String,
        // required: true,
    },
    gender: {
        type: String
    },

    mobileNumber: {
        type: Number,
        // required: true,
    },
    mobileVerified:{
        type: Boolean,
        default: false
    },
    dateOfBirth: {
        type: Date,
    },
    salonId: {
        type: Number,
        default: 0
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
    isApproved: {
        type: Boolean,
        default: false
    },
    profile: [
        {
            public_id: {
                type: String
            },
            url: {
                type: String,
            }
        }
    ],
    isOnline: {
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
        servicePrice:{
            type: String
        },
        barberServiceEWT: {
            type: Number
        }

    }],
    // total time waiting
    barberEWT: {
        type: Number,
        default: 0,
    },
    //populate this field with the count 
    queueCount: {
        type: Number,
        default: 0
    },
    isOnline: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean,
        default: false
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