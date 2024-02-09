const express = require("express");
const { getAllBarberbySalonId, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus,  isBarberOnline, getAllBarbersByServiceId, getBarberServicesByBarberId, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, insertDetailsByBarber, connectBarbertoSalon, createBarberByAdmin, updateBarberByAdmin, updateBarberAccountDetails, getBarberDetailsByEmail, uploadBarberprofilePic, updateBarberProfilePic, deleteBarberProfilePicture, isBarberLoggedOutMiddleware, isBarberLogginMiddleware, sendVerificationCodeForBarberEmail, changeBarberEmailVerifiedStatus, handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController");
const {  handleProtectedRoute, isLogginMiddleware } = require("../../controllers/admin/adminRegisterController");


const router = express.Router();

// router.route("/registerBarberByAdmin").post(registerBarberByAdmin)


// router.route("/login").post(auth, barberLogin) //api integrate


// router.route("/addBarberServices").post(addServicesTobarbers)

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
router.route("/barberLoggedoutmiddleware").get(handleBarberProtectedRoute,isBarberLoggedOutMiddleware)

//ISLOGIN MIDDLEWARE
router.route("/barberLoggedinmiddleware").get(handleBarberProtectedRoute, isBarberLogginMiddleware)

//ALL PROTECTED ROUTES
// router.route("/profile").get(handleProtectedRoute,profileController)


//CONNECT BARBER TO SALON
router.route("/connectBarberToSalon").post(handleBarberProtectedRoute,connectBarbertoSalon)

//CREATE BARBER BY ADMIN
router.route("/createBarberByAdmin").post(handleProtectedRoute,createBarberByAdmin)

//UPDATE BARBER BY ADMIN
router.route("/updateBarberByAdmin").put(handleProtectedRoute,updateBarberByAdmin)

//GET BARBER DETAILS BY EMAIL
router.route("/getBarberDetailsByEmail").post(handleBarberProtectedRoute,getBarberDetailsByEmail)

router.route("/getAllBarberBySalonId").post(handleBarberProtectedRoute ,getAllBarberbySalonId) //api integrated

//Update Barber Account Details
router.route("/updateBarberAccountDetails").put(handleBarberProtectedRoute,updateBarberAccountDetails)

//Upload Barber Profile Picture
router.route("/uploadBarberProfilePicture").post(handleBarberProtectedRoute,uploadBarberprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateBarberProfilePicture").put(handleBarberProtectedRoute,updateBarberProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteBarberProfilePicture").delete(handleBarberProtectedRoute,deleteBarberProfilePicture)



router.route("/deleteBarberByEmail").post(handleBarberProtectedRoute,deleteBarber)


router.route("/changeBarberWorkingStatus").post(handleBarberProtectedRoute,chnageBarberWorkingStatus) //api working

router.route("/getAllBarbersByServiceId").get(handleBarberProtectedRoute,getAllBarbersByServiceId)

router.route("/getBarberServicesByBarberId").get(handleBarberProtectedRoute,getBarberServicesByBarberId)

router.route("/changeBarberOnlineStatus").post(handleBarberProtectedRoute, isBarberOnline)

//Send Mail to Admin for Verification
router.route("/sendVerificationCodeForBarberEmail").post(handleBarberProtectedRoute, sendVerificationCodeForBarberEmail )

//Send EmailVerifiedStatus
router.route("/changeBarberEmailVerifiedStatus").post(handleBarberProtectedRoute, changeBarberEmailVerifiedStatus )

module.exports = router;