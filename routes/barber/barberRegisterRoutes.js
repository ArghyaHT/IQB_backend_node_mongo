const express = require("express");
const { getAllBarberbySalonId, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus,  isBarberOnline, getAllBarbersByServiceId, getBarberServicesByBarberId, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, insertDetailsByBarber, connectBarbertoSalon, createBarberByAdmin, updateBarberByAdmin, updateBarberAccountDetails, getBarberDetailsByEmail, uploadBarberprofilePic, updateBarberProfilePic, deleteBarberProfilePicture } = require("../../controllers/barber/barberRegisterController");
const { isLoggedOutMiddleware, isLogginMiddleware, handleProtectedRoute } = require("../../controllers/admin/adminRegisterController");


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

//ALL PROTECTED ROUTES
// router.route("/profile").get(handleProtectedRoute,profileController)


//ISLOGOUT MIDDLEWARE
router.route("/loggedoutmiddleware").get(handleProtectedRoute,isLoggedOutMiddleware)

//ISLOGIN MIDDLEWARE
router.route("/loggedinmiddleware").get(handleProtectedRoute, isLogginMiddleware)


//CONNECT BARBER TO SALON
router.route("/connectBarberToSalon").post(handleProtectedRoute,connectBarbertoSalon)

//CREATE BARBER BY ADMIN
router.route("/createBarberByAdmin").post(handleProtectedRoute,createBarberByAdmin)

//UPDATE BARBER BY ADMIN
router.route("/updateBarberByAdmin").put(handleProtectedRoute,updateBarberByAdmin)

//GET BARBER DETAILS BY EMAIL
router.route("/getBarberDetailsByEmail").post(handleProtectedRoute,getBarberDetailsByEmail)

router.route("/getAllBarberBySalonId").post(handleProtectedRoute ,getAllBarberbySalonId) //api integrated

//Update Barber Account Details
router.route("/updateBarberAccountDetails").put(handleProtectedRoute,updateBarberAccountDetails)

//Upload Barber Profile Picture
router.route("/uploadBarberProfilePicture").post(handleProtectedRoute,uploadBarberprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateBarberProfilePicture").put(handleProtectedRoute,updateBarberProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteBarberProfilePicture").delete(handleProtectedRoute,deleteBarberProfilePicture)



router.route("/deleteBarberByEmail").post(handleProtectedRoute,deleteBarber)


router.route("/changeBarberWorkingStatus").post(handleProtectedRoute,chnageBarberWorkingStatus) //api working

router.route("/getAllBarbersByServiceId").get(handleProtectedRoute,getAllBarbersByServiceId)

router.route("/getBarberServicesByBarberId").get(handleProtectedRoute,getBarberServicesByBarberId)

// router.route("/changeBarberOnlineStatus").put(isBarberOnline)

module.exports = router;