const express = require("express");
const { getAllBarberbySalonId, updateBarber, deleteBarber, addServicesTobarbers, barberLogin, chnageBarberWorkingStatus, registerBarberByAdmin } = require("../../controllers/barber/barberRegisterController");
const { barberValidateSignUp, validate } = require("../../middlewares/barberRegisterValidate");
const { auth } = require("../../utils/AuthUser")


const router = express.Router();

router.route("/registerBarberByAdmin").post(registerBarberByAdmin)


router.route("/login").post(auth, barberLogin) //api integrated


// router.route("/addBarberServices").post(addServicesTobarbers)



router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId) //api integrated

router.route("/updateBarberByEmail").post(auth, updateBarber)

router.route("/deleteBarberByEmail").post(auth, deleteBarber)


router.route("/changeBarberWorkingStatus").post(chnageBarberWorkingStatus) //api working

module.exports = router;