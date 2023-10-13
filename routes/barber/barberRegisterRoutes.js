const express = require("express");
const { registerBarber, getAllBarberbySalonId, updateBarber, deleteBarber, addServicesTobarbers, barberLogin } = require("../../controllers/barber/barberRegisterController");
const { barberValidateSignUp, validate } = require("../../middlewares/barberRegisterValidate");
const { auth } = require("../../utils/AuthUser")


const router = express.Router();

router.route("/registerBarber").post(barberValidateSignUp,validate, registerBarber)


router.route("/login").post( barberLogin)


router.route("/addBarberServices").post(addServicesTobarbers)



router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId)

router.route("/updateBarberByEmail").post(updateBarber)

router.route("/deleteBarberByEmail").delete(deleteBarber)

module.exports = router;