const express = require("express");
const { validateSignUp, validate } = require("../../middlewares/registerValidator");
const { adminSignUp, allAdmins, deleteSingleAdmin, updateAdmin, forgetAdminPassword, resetAdminpassword, adminLogin, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, handleProtectedRoute, approveBarber, updateAdminAccountDetails, uploadAdminprofilePic, updateAdminProfilePic, deleteAdminProfilePicture } = require("../../controllers/admin/adminRegisterController.js");

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

//ALL PROTECTED ROUTES
router.route("/profile").get(handleProtectedRoute,profileController)
// router.route("/getAllAdmins").get(allAdmins)

router.route("/deleteAdmin").post( deleteSingleAdmin)

//Upload Admin Profile Picture
router.route("/uploadAdminProfilePicture").post(uploadAdminprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateAdminProfilePicture").put(updateAdminProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteAdminProfilePicture").delete(deleteAdminProfilePicture)


//UPDATE ADMIN ACCOUNT DETAILS
router.route("/updateAdminAcoountDetails").put( updateAdminAccountDetails)

//Approve Barber By Admin
router.route("/approvedBarber").post(approveBarber)

module.exports = router
