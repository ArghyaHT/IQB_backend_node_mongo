const express = require("express")
const { salonSignUp,  searchSalonsByCity, getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices,  } = require("../../controllers/admin/salonRegisterController")


const router = express.Router()


//SalonSignUp
router.route("/createSalon").post(salonSignUp)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByCity").post(searchSalonsByCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation)

router.route("/getSalonInfoBySalonId").get(getSalonInfo)

router.route("/updateSalonBySalonIdAndAdminEmail").post(updateSalonBySalonIdAndAdminEmail)

router.route("/allSalonServices").post(allSalonServices)

router.route("/updateSalonServiceByServiceId").put(updateSalonServiceByServiceId)

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)



module.exports = router