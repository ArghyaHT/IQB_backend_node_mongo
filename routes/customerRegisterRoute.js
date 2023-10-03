const express = require("express")
const { signUp, signIn, forgetPassword, resetpassword, allCustomers, deleteSingleCustomer, updateCustomer,  } = require("../controllers/customerRegisterController")
const { validateSignUp, validate } = require("../middlewares/registerValidator")


const router = express.Router()

//SignUp
router.route("/signUp").post(validateSignUp, validate ,signUp)

//SignIn
router.route("/signIn").post(signIn)

//Forget Password
router.route("/forgetPassword").post(forgetPassword)

//ResetPassword
router.route("/resetPassword").post(resetpassword)

//GetAllCustomers
router.route("/getAllCustomers").get(allCustomers)


//DeleteCustomers
router.route("/deleteCustomer").delete(deleteSingleCustomer)


//UpdateCustomers
router.route("/updateCustomer").put(updateCustomer)


module.exports = router