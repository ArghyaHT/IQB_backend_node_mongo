const express = require("express");
const { getAllBarberbySalonId, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus,  isBarberOnline, getAllBarbersByServiceId, getBarberServicesByBarberId, registerController, loginController, handleLogout, handleForgetPassword, handleResetPassword, googleLoginController, refreshTokenController, profileController, handleProtectedRoute, insertDetailsByBarber, connectBarbertoSalon, createBarberByAdmin, updateBarberByAdmin, updateBarberAccountDetails, getBarberDetailsByEmail } = require("../../controllers/barber/barberRegisterController");


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
router.route("/profile").get(handleProtectedRoute,profileController)

//CONNECT BARBER TO SALON
router.route("/connectBarberToSalon").post(connectBarbertoSalon)

//CREATE BARBER BY ADMIN
router.route("/createBarberByAdmin").post(createBarberByAdmin)

//UPDATE BARBER BY ADMIN
router.route("/updateBarberByAdmin").put(updateBarberByAdmin)

//GET BARBER DETAILS BY EMAIL
router.route("/getBarberDetailsByEmail").post(getBarberDetailsByEmail)

router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId) //api integrated

//Update Barber Account Details
router.route("/updateBarberAccountDetails").put( updateBarberAccountDetails)

router.route("/deleteBarberByEmail").post( deleteBarber)


router.route("/changeBarberWorkingStatus").post(chnageBarberWorkingStatus) //api working

router.route("/getAllBarbersByServiceId").get(getAllBarbersByServiceId)

router.route("/getBarberServicesByBarberId").get(getBarberServicesByBarberId)

// router.route("/changeBarberOnlineStatus").put(isBarberOnline)

module.exports = router;