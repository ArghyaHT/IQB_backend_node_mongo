const express = require("express");
const { getAllBarberbySalonId, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus,  isBarberOnline, getAllBarbersByServiceId, getBarberServicesByBarberId, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, insertDetailsByBarber, connectBarbertoSalon, createBarberByAdmin, updateBarberByAdmin, updateBarberAccountDetails, getBarberDetailsByEmail, uploadBarberprofilePic, updateBarberProfilePic, deleteBarberProfilePicture, isBarberLoggedOutMiddleware, isBarberLogginMiddleware, sendVerificationCodeForBarberEmail, changeBarberEmailVerifiedStatus, handleBarberProtectedRoute, BarberLoggedIn, updateBarber, googleBarberSignup, googleBarberLogin } = require("../../controllers/barber/barberRegisterController");
const { allSalonServices } = require("../../controllers/admin/salonRegisterController");
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin.js");
const verifyRefreshTokenBarber = require("../../middlewares/Barber/VerifyRefreshTokenBarber.js");
const { barberServedQueue } = require("../../controllers/Queueing/joinQueueController");


const router = express.Router();

// router.route("/registerBarberByAdmin").post(registerBarberByAdmin)


// router.route("/login").post(auth, barberLogin) //api integrate


// router.route("/addBarberServices").post(addServicesTobarbers)

//AUTH ROUTES
router.route("/register").post(registerController)
router.route("/login").post(loginController)
router.route('/logout').post(handleLogout)
router.route("/barberloggedin").get(BarberLoggedIn)
router.route("/updateBarber").put(updateBarber)

router.route("/googleBarberSignUp").post(googleBarberSignup)
router.route("/googleBarberLogin").post(googleBarberLogin)


router.route('/forget-password').post(handleForgetPassword)
router.route('/reset-password/:token').post(handleResetPassword)




// //ISLOGOUT MIDDLEWARE
// router.route("/barberLoggedoutmiddleware").get(handleBarberProtectedRoute,isBarberLoggedOutMiddleware)

// //ISLOGIN MIDDLEWARE
// router.route("/barberLoggedinmiddleware").get(handleBarberProtectedRoute, isBarberLogginMiddleware)


//CREATE BARBER BY ADMIN
router.route("/createBarberByAdmin").post(verifyRefreshTokenAdmin,createBarberByAdmin)

//UPDATE BARBER BY ADMIN
router.route("/updateBarberByAdmin").put(verifyRefreshTokenAdmin, updateBarberByAdmin)

router.route("/getAllBarberBySalonId").post(verifyRefreshTokenAdmin, getAllBarberbySalonId) 

router.route("/getBarberServicesByBarberId").get(verifyRefreshTokenAdmin,getBarberServicesByBarberId)

//---------==========================================================================------------//

//GET ALL SALON SERVICES
router.route("/barberAllSalonServices").get(verifyRefreshTokenBarber, allSalonServices)
//CONNECT BARBER TO SALON
router.route("/connectBarberToSalon").post(verifyRefreshTokenBarber,connectBarbertoSalon)

//==============================================//

//Update Barber Account Details
router.route("/updateBarberAccountDetails").put(verifyRefreshTokenBarber,updateBarberAccountDetails)

//Upload Barber Profile Picture
router.route("/uploadBarberProfilePicture").post(verifyRefreshTokenBarber,uploadBarberprofilePic)

//UPDATE BARBER PROFILE PICTURE
router.route("/updateBarberProfilePicture").put(verifyRefreshTokenBarber,updateBarberProfilePic)

//DELETE BARBER PROFILE PICTURE
router.route("/deleteBarberProfilePicture").delete(verifyRefreshTokenBarber,deleteBarberProfilePicture)



router.route("/deleteBarberByEmail").post(verifyRefreshTokenBarber,deleteBarber)


router.route("/changeBarberWorkingStatus").post(verifyRefreshTokenBarber,chnageBarberWorkingStatus) //api working

router.route("/getAllBarbersByServiceId").get(verifyRefreshTokenBarber,getAllBarbersByServiceId)

//Send Mail to Admin for Verification
router.route("/sendVerificationCodeForBarberEmail").post(verifyRefreshTokenBarber, sendVerificationCodeForBarberEmail )

//Send EmailVerifiedStatus
router.route("/changeBarberEmailVerifiedStatus").post(verifyRefreshTokenBarber, changeBarberEmailVerifiedStatus )


//============================Common Routes for Admin And Barber=======================//
//GET ALL SALON SERVICES
router.route("/allSalonServices").get(verifyRefreshTokenBarber, allSalonServices) //need to do for barberAlso

//BarberServed Api
router.route("/barberServedQueue").post(verifyRefreshTokenBarber, barberServedQueue)

//GET BARBER DETAILS BY EMAIL
router.route("/getBarberDetailsByEmail").post(verifyRefreshTokenBarber,getBarberDetailsByEmail)

router.route("/changeBarberOnlineStatus").post(verifyRefreshTokenBarber, isBarberOnline)


module.exports = router;