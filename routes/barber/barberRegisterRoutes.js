const express = require("express");
const { registerBarber, getAllBarberbySalonId, updateBarber, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus } = require("../../controllers/barber/barberRegisterController");
const { barberValidateSignUp, validate } = require("../../middlewares/barberRegisterValidate");
const { auth } = require("../../utils/AuthUser")


const router = express.Router();

// router.route("/registerBarber").post(barberValidateSignUp,validate, registerBarber)


router.route("/login").post(auth, barberLogin) //api integrated


// router.route("/addBarberServices").post(addServicesTobarbers)



router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId) //api integrated

router.route("/updateBarberByEmail").post(auth, updateBarber)

router.route("/deleteBarberByEmail").post(auth, deleteBarber)


router.route("/changeBarberWorkingStatus").post(chnageBarberWorkingStatus) //api working

module.exports = router;