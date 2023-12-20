const express = require("express");
const { getAllSalons } = require("../../controllers/admin/salonRegisterController");

const router = express.Router();


//GetAll Salons
router.route("/getAllSalonsMob").get(getAllSalons)

module.exports = router 