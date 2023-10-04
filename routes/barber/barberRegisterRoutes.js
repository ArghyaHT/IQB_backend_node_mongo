const express = require("express");
const { registerBarber, getAllBarberbySalonId, updateBarber, deleteBarber } = require("../../controllers/barber/barberRegisterController");
const { barberValidateSignUp, validate } = require("../../middlewares/barberRegisterValidate");


const router = express.Router();

router.route("/registerBarber").post(barberValidateSignUp,validate, registerBarber)

router.route("/getAllBarberBySalonId").post(getAllBarberbySalonId)

router.route("/updateBarberByEmail").put(updateBarber)

router.route("/deleteBarberByEmail").delete(deleteBarber)

module.exports = router;