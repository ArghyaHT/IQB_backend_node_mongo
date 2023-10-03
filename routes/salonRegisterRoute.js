const express = require("express")
const { salonSignUp,  searchSalonsByCity, getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId,  } = require("../controllers/salonRegisterController")


const router = express.Router()


//SalonSignUp
router.route("/salonSignUp").post(salonSignUp)

router.route("/searchByCity").post(searchSalonsByCity)

router.route("/getSalonInfoBySalonId").post(getSalonInfo)

router.route("/updateSalonBySalonIdAndAdminEmail").post(updateSalonBySalonIdAndAdminEmail)

router.route("/allSalonServices").post(allSalonServices)

router.route("/updateSalonServiceByServiceId").put(updateSalonServiceByServiceId)

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)



module.exports = router