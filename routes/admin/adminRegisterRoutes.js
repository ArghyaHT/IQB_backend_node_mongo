const express = require("express");
const { validateSignUp, validate } = require("../../middlewares/registerValidator");
const { adminSignUp, allAdmins, deleteSingleAdmin, updateAdmin, forgetAdminPassword, resetAdminpassword, adminLogin, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, handleProtectedRoute, approveBarber, updateAdminAccountDetails, uploadAdminprofilePic, updateAdminProfilePic, deleteAdminProfilePicture, isLoggedOutMiddleware, isLogginMiddleware, getAllSalonsByAdmin, changeDefaultSalonIdOfAdmin, sendVerificationCodeForAdminEmail, changeEmailVerifiedStatus, getDefaultSalonByAdmin, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController.js");

const router = express.Router();

//AUTH ROUTES
router.route("/register").post(registerController)
router.route("/login").post(loginController)
router.route('/logout').post(handleLogout)
router.route('/forget-password').post(handleForgetPassword)
router.route('/reset-password/:token').post(handleResetPassword)

//GOOGLE_LOGIN
router.route("/google-login").post(googleLoginController)

//FOR REFRESHING NEW ACCESS TOKEN
router.route("/refresh-token").post(refreshTokenController)

//ISLOGOUT MIDDLEWARE
router.route("/loggedoutmiddleware").get(handleAdminProtectedRoute,isLoggedOutMiddleware)

//ISLOGIN MIDDLEWARE
router.route("/loggedinmiddleware").get(handleAdminProtectedRoute, isLogginMiddleware)

//ALL PROTECTED ROUTES
// router.route("/profile").get(handleProtectedRoute,profileController)
// router.route("/getAllAdmins").get(allAdmins)

router.route("/deleteAdmin").post(handleAdminProtectedRoute,deleteSingleAdmin)

//Upload Admin Profile Picture
router.route("/uploadAdminProfilePicture").post(handleAdminProtectedRoute, uploadAdminprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateAdminProfilePicture").put(handleAdminProtectedRoute, updateAdminProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteAdminProfilePicture").delete(handleAdminProtectedRoute, deleteAdminProfilePicture)

//UPDATE ADMIN ACCOUNT DETAILS
router.route("/updateAdminAcoountDetails").put(handleAdminProtectedRoute, updateAdminAccountDetails)

//Approve Barber By Admin
router.route("/approvedBarber").post(handleAdminProtectedRoute,approveBarber)

//Get All Salons By Admin
router.route("/getAllSalonsByAdmin").post(handleAdminProtectedRoute,getAllSalonsByAdmin)

//Change Default SalonId Of Admin
router.route("/changeDefaultSalonIdofAdmin").post(handleAdminProtectedRoute, changeDefaultSalonIdOfAdmin)

//Send Mail to Admin for Verification
router.route("/sendVerificationCodeForAdminEmail").post(handleAdminProtectedRoute, sendVerificationCodeForAdminEmail)

//Send EmailVerifiedStatus
router.route("/changeEmailVerifiedStatus").post(handleAdminProtectedRoute, changeEmailVerifiedStatus)

//Get Default Salon Of Admin
router.route("/getDefaultSalonByAdmin").post(handleAdminProtectedRoute, getDefaultSalonByAdmin)


module.exports = router
