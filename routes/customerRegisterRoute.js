const express = require("express")
const { signUp, signIn, forgetPassword, resetpassword,  } = require("../controllers/customerRegisterController")


const router = express.Router()

//SignUp
router.route("/signUp").post(signUp)

//SignIn
router.route("/signIn").get(signIn)

//Forget Password
router.route("/forgetPassword").post(forgetPassword)

//ResetPassword
router.route("/resetPassword").post(resetpassword)


module.exports = router