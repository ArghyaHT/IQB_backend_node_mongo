const express = require("express");
const { addIcons, getAllIcons } = require("../../controllers/icons/iconsController.js");

const router = express.Router();

router.route("/addIcons").post(addIcons)

router.route("/getAllIcons").get(getAllIcons)

module.exports =  router;