const express = require("express")
const { salonSignUp, getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin, searchSalonsByNameAndCity, deleteSalon, createSalon, uploadProfile,  } = require("../../controllers/admin/salonRegisterController")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(getAllSalonsByAdmin) //api integrated

//SalonSignUp
router.route("/createSalon").post(salonSignUp) //api integrated

//Upload Salon Image
router.route("/uploadSalonImage").post(uploadProfile)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByCity").post(searchSalonsByNameAndCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working

router.route("/updateSalonBySalonIdAndAdminEmail").post(updateSalonBySalonIdAndAdminEmail)

//GET ALL SALON SERVICES
router.route("/allSalonServices").get(allSalonServices) //api working

router.route("/updateSalonServiceByServiceId").put(updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

//SOFT DELETE SALON
router.route("/deleteSalon").post(deleteSalon)

module.exports = router 