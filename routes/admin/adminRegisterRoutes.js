const express = require("express");
const { validateSignUp, validate } = require("../../middlewares/registerValidator");
const { adminSignUp, allAdmins, deleteSingleAdmin, updateAdmin, forgetAdminPassword, resetAdminpassword, adminLogin, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, handleProtectedRoute, approveBarber, updateAdminAccountDetails, uploadAdminprofilePic, updateAdminProfilePic, deleteAdminProfilePicture, isLoggedOutMiddleware, isLogginMiddleware, getAllSalonsByAdmin, changeDefaultSalonIdOfAdmin, sendVerificationCodeForAdminEmail, changeEmailVerifiedStatus, getDefaultSalonByAdmin, handleAdminProtectedRoute, AdminLoggedIn, demoController, googleAdminSignup, googleAdminLogin } = require("../../controllers/admin/adminRegisterController.js");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");

const router = express.Router();

//AUTH ROUTES
router.route("/register").post(registerController)
router.route("/login").post(loginController)
router.route('/logout').post(handleLogout)
router.route("/adminloggedin").get(AdminLoggedIn)
router.route("/updateadmin").put(updateAdmin)

router.route("/demo").get(verifyRefreshTokenAdmin, demoController)


router.route('/forget-password').post(handleForgetPassword)
router.route('/reset-password/:token').post(handleResetPassword)

router.route("/googleAdminSignUp").post(googleAdminSignup)
router.route("/googleAdminLogin").post(googleAdminLogin)


// //GOOGLE_LOGIN
// router.route("/google-login").post(googleLoginController)

//FOR REFRESHING NEW ACCESS TOKEN
router.route("/refresh-token").post(refreshTokenController)

// //ISLOGOUT MIDDLEWARE
// router.route("/loggedoutmiddleware").get(verifyRefreshTokenAdmin,isLoggedOutMiddleware)

// //ISLOGIN MIDDLEWARE
// router.route("/loggedinmiddleware").get(verifyRefreshTokenAdmin, isLogginMiddleware)

//ALL PROTECTED ROUTES
// router.route("/profile").get(handleProtectedRoute,profileController)
// router.route("/getAllAdmins").get(allAdmins)

router.route("/deleteAdmin").post(verifyRefreshTokenAdmin,deleteSingleAdmin)

//Upload Admin Profile Picture
router.route("/uploadAdminProfilePicture").post(verifyRefreshTokenAdmin, uploadAdminprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateAdminProfilePicture").put(verifyRefreshTokenAdmin, updateAdminProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteAdminProfilePicture").delete(verifyRefreshTokenAdmin, deleteAdminProfilePicture)

//UPDATE ADMIN ACCOUNT DETAILS
router.route("/updateAdminAcoountDetails").put(verifyRefreshTokenAdmin, updateAdminAccountDetails)

//Approve Barber By Admin
router.route("/approvedBarber").post(verifyRefreshTokenAdmin,approveBarber)

//Get All Salons By Admin
router.route("/getAllSalonsByAdmin").post(verifyRefreshTokenAdmin,getAllSalonsByAdmin)

//Change Default SalonId Of Admin
router.route("/changeDefaultSalonIdofAdmin").post(verifyRefreshTokenAdmin, changeDefaultSalonIdOfAdmin)

//Send Mail to Admin for Verification
router.route("/sendVerificationCodeForAdminEmail").post(verifyRefreshTokenAdmin, sendVerificationCodeForAdminEmail)

//Send EmailVerifiedStatus
router.route("/changeEmailVerifiedStatus").post(verifyRefreshTokenAdmin, changeEmailVerifiedStatus)

//Get Default Salon Of Admin
router.route("/getDefaultSalonByAdmin").post(verifyRefreshTokenAdmin, getDefaultSalonByAdmin)


module.exports = router
