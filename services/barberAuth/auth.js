const express = require("express")
const router = express.Router()
const admin = require("../../config/firebase.config")
const User = require("../models/Users")
const Admin = require("../models/Admin")


// const auth = async (req, res, next) => {
//     try {
//         if (!req.headers.authorization) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Token is required or invalid"
//             })
//         }

//         const token = req.headers.authorization.split(" ")[1]

//         const decodeValue = await admin.auth().verifyIdToken(token)

//         if (!decodeValue) {
//             return res.status(500).json({
//                 success: false,
//                 message: "UnAuthorized User"
//             })
//         }

//         const userdata = req.body.user || false
//         const admindata = req.body.admin || false

//         req.user = {decodeValue:decodeValue, user:userdata,admin:admindata }   
//         next()

//     } catch (error) {
//         return res.status(404).json({
//             success: false,
//             message: error
//         })
//     }
// }


router.post("/login", auth, async (req, res) => {
    try {
        const newuser = req.user

        const userExists = await User.findOne({ userId: newuser.decodeValue.user_id })

        if (!userExists) {
            //create new user
            try {
                const newUser = new User({
                    name: newuser.decodeValue.name,
                    email: newuser.decodeValue.email,
                    userId: newuser.decodeValue.user_id,
                    email_verified: newuser.decodeValue.email_verified,
                    auth_time: newuser.decodeValue.auth_time,
                    isAdmin: newuser.admin,
                    isUser:newuser.user
                })

                const savedUser = await newUser.save()

                res.status(200).json({
                    success: true,
                    message: "User created successfully",
                    user: savedUser
                })
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error
                })
            }

        } else {
            try {
                const filter = { userId: newuser.decodeValue.user_id }
                const options = {
                    upsert: true,
                    new: true
                }

                const result = await User.findOneAndUpdate(filter, {
                    $set: {
                        auth_time: newuser.decodeValue.auth_time
                    }
                }, options)

                res.status(200).json({
                    success: true,
                    message: "User auth time updated successfully",
                    user: result
                })
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: error
                })
            }
        }

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error
        })
    }
})


router.post("/admin/login", auth, async (req, res) => {
    try {
        const newuser = req.user

        const userExists = await Admin.findOne({ userId: newuser.decodeValue.user_id })

        if (!userExists) {
            //create new user
            try {
                const newUser = new Admin({
                    name: newuser.decodeValue.name,
                    email: newuser.decodeValue.email,
                    userId: newuser.decodeValue.user_id,
                    email_verified: newuser.decodeValue.email_verified,
                    auth_time: newuser.decodeValue.auth_time,
                    isAdmin: newuser.admin,
                    isUser:newuser.user
                })

                const savedUser = await newUser.save()

                res.status(200).json({
                    success: true,
                    message: "Admin created successfully",
                    user: savedUser
                })
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error
                })
            }

        } else {
            try {
                const filter = { userId: newuser.decodeValue.user_id }
                const options = {
                    upsert: true,
                    new: true
                }

                const result = await Admin.findOneAndUpdate(filter, {
                    $set: {
                        auth_time: newuser.decodeValue.auth_time
                    }
                }, options)

                res.status(200).json({
                    success: true,
                    message: "Admin auth time updated successfully",
                    user: result
                })
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: error
                })
            }
        }

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error
        })
    }
})

router.get("/",(req,res) => {
    res.send("new router")
})

router.get("/admin/data",async(req,res) => {
    try {
        res.send("Data that Admins can only see.")
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error
        })
    }
})

module.exports = router




// userModel

const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        required:true
    },
    // imageURL:{
    //     type:String,
    //     required:true
    // },
    userId:{
        type:String,
        required:true
    },
    email_verified:{
        type:Boolean,
        required:true
    },
    auth_time:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },

    isUser:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User



//