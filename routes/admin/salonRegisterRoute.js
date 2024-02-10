const express = require("express")
const {  getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin, searchSalonsByNameAndCity, deleteSalon, createSalonByAdmin, updateSalonImages, deleteSalonImages, getAllSalons, changeSalonOnlineStatus, uploadSalonLogo, getSalonLogo, deleteSalonLogo, uploadSalonGallery, uploadMoreSalonGalleryImages, getSalonImages, updateSalonLogo,  } = require("../../controllers/admin/salonRegisterController")
const { handleProtectedRoute, changeDefaultSalonIdOfAdmin, isLogginMiddleware, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController")
const { handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(handleAdminProtectedRoute,getAllSalonsByAdmin) //api integrated

//CREATE SALON BY ADMIN
router.route("/createSalonByAdmin").post(handleAdminProtectedRoute,createSalonByAdmin) //api integrated

//UPLOAD SALON IMAGE
router.route("/uploadSalonImage").post(handleAdminProtectedRoute,uploadSalonGallery)

//UPLOAD MORE IMAGES TO THE EXISTING ARRAY OF IMAGES
router.route("/uploadMoreImages").post(handleAdminProtectedRoute, uploadMoreSalonGalleryImages)

//UPDATE SALON IMAGES
router.route("/updateSalonImages").put(handleAdminProtectedRoute,updateSalonImages)

//DELETE SALON IMAGES
router.route("/deleteSalonImages").delete(handleAdminProtectedRoute, deleteSalonImages)
//DELETE SALON IMAGES
router.route("/getSalonImages").post(getSalonImages)

//UPDATE SALON BY ADMIN EMAIL AND SALON ID
router.route("/updateSalonBySalonIdAndAdminEmail").put(handleAdminProtectedRoute,updateSalonBySalonIdAndAdminEmail)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByNameAndCity").post(searchSalonsByNameAndCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working



//GET ALL SALON SERVICES
router.route("/allSalonServices").get(handleProtectedRoute, allSalonServices) //api working

router.route("/updateSalonServiceByServiceId").put(handleAdminProtectedRoute,updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

//SOFT DELETE SALON
router.route("/deleteSalon").post(handleAdminProtectedRoute,deleteSalon)

//GetAll Salons
router.route("/getAllSalons").get(handleBarberProtectedRoute,getAllSalons)

//Change Salon online Status
router.route("/changeSalonOnlineStatus").post(handleAdminProtectedRoute,changeSalonOnlineStatus )

//Upload Salon Logo
router.route("/uploadSalonLogo").post(handleAdminProtectedRoute, uploadSalonLogo)

//Update Salon Logo
router.route("/updateSalonLogo").put(handleAdminProtectedRoute, updateSalonLogo)

//Get Salon Logo
router.route("/getSalonLogo").post(getSalonLogo)

//Delete Salon Logo
router.route("/deleteSalonLogo").delete(deleteSalonLogo)


module.exports = router 