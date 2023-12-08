const express = require("express")
const { salonSignUp, getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin, searchSalonsByNameAndCity, deleteSalon, createSalon, uploadProfile, createSalonByAdmin,  } = require("../../controllers/admin/salonRegisterController")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(getAllSalonsByAdmin) //api integrated

//CREATE SALON BY ADMIN
router.route("/createSalonByAdmin").post(createSalonByAdmin) //api integrated

//UPLOAD SALON IMAGE
router.route("/uploadSalonImage").post(uploadProfile)

//UPDATE SALON BY ADMIN EMAIL AND SALON ID
router.route("/updateSalonBySalonIdAndAdminEmail").put(updateSalonBySalonIdAndAdminEmail)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByCity").post(searchSalonsByNameAndCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working



//GET ALL SALON SERVICES
router.route("/allSalonServices").get(allSalonServices) //api working

router.route("/updateSalonServiceByServiceId").put(updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

//SOFT DELETE SALON
router.route("/deleteSalon").post(deleteSalon)

module.exports = router 