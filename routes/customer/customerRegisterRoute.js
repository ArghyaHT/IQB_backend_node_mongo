const express = require("express")
const { signUp, signIn, forgetPassword, resetpassword, allCustomers, deleteSingleCustomer, updateCustomer, sendMailToCustomer, checkEmail, matchVerificationCode, getAppointmentForCustomer, customerConnectSalon, verifyPasswordResetCode, getCustomerDetails, savePassword,  } = require("../../controllers/customer/customerRegisterController.js")
const { validateSignUp, validate } = require("../../middlewares/registerValidator")


const router = express.Router()

//CheckEmail
router.route("/checkEmail").post(checkEmail)

//SignUp
router.route("/signUp").post(signUp)

//Match Verification Code
router.route("/matchVerificationCode").post(matchVerificationCode)

//Save Password
router.route("/savePassword").post(savePassword)

//SignIn
router.route("/signIn").post(signIn)

//Forget Password
router.route("/forgetPassword").post(forgetPassword)

//Match Vaerification Code
router.route("/verifyPasswordResetCode").post(verifyPasswordResetCode)

//ResetPassword
router.route("/resetPassword/:token").post(resetpassword)

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

//Connect Customer to the Salon
router.route("/customerConnectSalon").post(customerConnectSalon)

//Get Customer Details By CustomerId
router.route("/getCustomerDetails").post(getCustomerDetails)

module.exports = router