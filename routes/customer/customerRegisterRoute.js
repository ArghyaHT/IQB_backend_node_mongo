const express = require("express")
const { signUp, signIn, forgetPassword, allCustomers, deleteSingleCustomer, updateCustomer, sendMailToCustomer, checkEmail, matchVerificationCode, getAppointmentForCustomer, customerConnectSalon, verifyPasswordResetCode, getCustomerDetails, savePassword, resetPassword, sendBulkEmailToCustomers, uploadCustomerprofilePic, updateCustomerProfilePic, deleteCustomerProfilePicture, getAllAppointmentsByCustomer, getAllSalonsByCustomer, changeDefaultSalonIdOfCustomer,  } = require("../../controllers/customer/customerRegisterController.js")
const { validateSignUp, validate } = require("../../middlewares/registerValidator")
const { handleProtectedRoute } = require("../../controllers/admin/adminRegisterController.js")


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
router.route("/resetPassword").post(resetPassword)

//GetAllCustomers
router.route("/getAllCustomers").get(allCustomers)

// getAllCustomers by Salon ID

//DeleteCustomers
router.route("/deleteCustomer").delete(deleteSingleCustomer)


//UpdateCustomers
router.route("/updateCustomer").put(updateCustomer)


//SendMailToCustomer

router.route("/sendMailToCustomer").post(handleProtectedRoute, sendMailToCustomer)

//Connect Customer to the Salon
router.route("/customerConnectSalon").post(customerConnectSalon)

//Get Customer Details By CustomerId
router.route("/getCustomerDetails").post(getCustomerDetails)

//Get all appointments by Customer

router.route("/getAllAppointmentsByCustomerId").post(getAllAppointmentsByCustomer)


//Send Bulk Email to Customers
router.route("/sendBulkEmailToCustomers").post(sendBulkEmailToCustomers)

//Upload Customer Profile Pic
router.route("/uploadCustomerProfilePic").post(uploadCustomerprofilePic)

router.route("/updateCustomerProfilePic").put(updateCustomerProfilePic)

router.route("/deleteCustomerProfilePic").delete(deleteCustomerProfilePicture)


//Get All Connected Salons by Customer
router.route("/getAllConnectedSalons").post(getAllSalonsByCustomer)


//Change Salon Id of Customer
router.route("/changeDefaultSalonOfCustomer").post(changeDefaultSalonIdOfCustomer)

module.exports = router