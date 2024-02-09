const express = require("express");
const { getAllBarberbySalonId, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus,  isBarberOnline, getAllBarbersByServiceId, getBarberServicesByBarberId, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, insertDetailsByBarber, connectBarbertoSalon, createBarberByAdmin, updateBarberByAdmin, updateBarberAccountDetails, getBarberDetailsByEmail, uploadBarberprofilePic, updateBarberProfilePic, deleteBarberProfilePicture, isBarberLoggedOutMiddleware, isBarberLogginMiddleware, sendVerificationCodeForBarberEmail, changeBarberEmailVerifiedStatus } = require("../../controllers/barber/barberRegisterController");
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
router.route("/barberLoggedoutmiddleware").get(handleProtectedRoute,isBarberLoggedOutMiddleware)

//ISLOGIN MIDDLEWARE
router.route("/barberLoggedinmiddleware").get(handleProtectedRoute, isBarberLogginMiddleware)

//ALL PROTECTED ROUTES
// router.route("/profile").get(handleProtectedRoute,profileController)


//CONNECT BARBER TO SALON
router.route("/connectBarberToSalon").post(handleProtectedRoute,isBarberLogginMiddleware,connectBarbertoSalon)

//CREATE BARBER BY ADMIN
router.route("/createBarberByAdmin").post(handleProtectedRoute,isLogginMiddleware,createBarberByAdmin)

//UPDATE BARBER BY ADMIN
router.route("/updateBarberByAdmin").put(handleProtectedRoute,isLogginMiddleware,updateBarberByAdmin)

//GET BARBER DETAILS BY EMAIL
router.route("/getBarberDetailsByEmail").post(handleProtectedRoute,isBarberLogginMiddleware,getBarberDetailsByEmail)

router.route("/getAllBarberBySalonId").post(handleProtectedRoute ,getAllBarberbySalonId) //api integrated

//Update Barber Account Details
router.route("/updateBarberAccountDetails").put(handleProtectedRoute,isBarberLogginMiddleware,updateBarberAccountDetails)

//Upload Barber Profile Picture
router.route("/uploadBarberProfilePicture").post(handleProtectedRoute,isBarberLogginMiddleware,uploadBarberprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateBarberProfilePicture").put(handleProtectedRoute,isBarberLogginMiddleware,updateBarberProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteBarberProfilePicture").delete(handleProtectedRoute,isBarberLogginMiddleware,deleteBarberProfilePicture)



router.route("/deleteBarberByEmail").post(handleProtectedRoute,isBarberLogginMiddleware,deleteBarber)


router.route("/changeBarberWorkingStatus").post(handleProtectedRoute,isBarberLogginMiddleware,chnageBarberWorkingStatus) //api working

router.route("/getAllBarbersByServiceId").get(handleProtectedRoute,getAllBarbersByServiceId)

router.route("/getBarberServicesByBarberId").get(handleProtectedRoute,getBarberServicesByBarberId)

router.route("/changeBarberOnlineStatus").post(handleProtectedRoute, isBarberLogginMiddleware, isBarberOnline)

//Send Mail to Admin for Verification
router.route("/sendVerificationCodeForBarberEmail").post(handleProtectedRoute, sendVerificationCodeForBarberEmail )

//Send EmailVerifiedStatus
router.route("/changeBarberEmailVerifiedStatus").post(isBarberLogginMiddleware, changeBarberEmailVerifiedStatus )

module.exports = router;