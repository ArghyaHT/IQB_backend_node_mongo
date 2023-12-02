const express = require("express")
const { signUp, signIn, forgetPassword, resetpassword, allCustomers, deleteSingleCustomer, updateCustomer, sendMailToCustomer, checkEmail, matchVerificationCode, getAppointmentForCustomer, customerConnectSalon,  } = require("../../controllers/customer/customerRegisterController.js")
const { validateSignUp, validate } = require("../../middlewares/registerValidator")


const router = express.Router()

//CheckEmail
router.route("/checkEmail").post(checkEmail)

//SignUp
router.route("/signUp").post(signUp)

router.route("/matchVerificationCode").post(matchVerificationCode)

//SignIn
router.route("/signIn").post(signIn)

//Forget Password
router.route("/forgetPassword").post(forgetPassword)

//ResetPassword
router.route("/resetPassword").post(resetpassword)

//GetAllCustomers
router.route("/getAllCustomers").get(allCustomers)

// getAllCustomers by Salon ID

//DeleteCustomers
router.route("/deleteCustomer").delete(deleteSingleCustomer)


//UpdateCustomers
router.route("/updateCustomer").put(updateCustomer)


//SendMailToCustomer

router.route("/sendMailToCustomer").post(sendMailToCustomer)

//GetAppointmentsForCustomer

router.route("/getAppointmentsForCustomer").post(getAppointmentForCustomer)

router.route("/customerConnectSalon").post(customerConnectSalon)

module.exports = router