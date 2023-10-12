const express =  require("express");
const { auth } = require("../../utils/AuthUser");
const BarberAuth = require("../../models/barberAuthModel");

const router = express.Router()

router.route("/login").post(auth, async (req, res) => {
    try {
        const newuser = req.user

        const userExists = await BarberAuth.findOne({ email: newuser.decodeValue.email })

        if (!userExists) {
            //create new user
            try {
                const newUser = new BarberAuth({
                    name: newuser.decodeValue.name,
                    email: newuser.decodeValue.email,
                    email_verified: newuser.decodeValue.email_verified,
                    auth_time: newuser.decodeValue.auth_time,
                    isBarber:newuser.barber
                })

                const savedUser = await newUser.save()

                res.status(200).json({
                    success: true,
                    message: "Barber created successfully",
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
                const filter = { email: newuser.decodeValue.email }
                const options = {
                    upsert: true,
                    new: true
                }

                const result = await BarberAuth.findOneAndUpdate(filter, {
                    $set: {
                        auth_time: newuser.decodeValue.auth_time
                    }
                }, options)

                res.status(200).json({
                    success: true,
                    message: "Barber auth time updated successfully",
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




module.exports = router;

// Error
// res.status(400).json({
//     success:false,
//     message:error
// })