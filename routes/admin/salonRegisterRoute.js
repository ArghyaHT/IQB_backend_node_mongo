const express = require("express")
const { salonSignUp,  searchSalonsByCity, getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin,  } = require("../../controllers/admin/salonRegisterController")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(getAllSalonsByAdmin) //api integrated

//SalonSignUp
router.route("/createSalon").post(salonSignUp) //api integrated

// router.route("/addSalonServices").post(addServices)

router.route("/searchByCity").post(searchSalonsByCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working

router.route("/updateSalonBySalonIdAndAdminEmail").post(updateSalonBySalonIdAndAdminEmail)

router.route("/allSalonServices").get(allSalonServices) //api working

router.route("/updateSalonServiceByServiceId").put(updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

module.exports = router 