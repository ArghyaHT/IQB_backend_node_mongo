const express = require("express");
const { salonRating, } = require("../../controllers/Ratings/salonRatingController");
const { barberRating } = require("../../controllers/Ratings/barberRatingController");

const router = express.Router();

//Salon Ratings 
router.route("/salonRatings").post(salonRating)

//Barber Ratings
router.route("/barberRatings").post(barberRating)



module.exports = router 