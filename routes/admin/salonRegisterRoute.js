const express = require("express")
const {  getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin, searchSalonsByNameAndCity, deleteSalon, createSalonByAdmin, updateSalonImages, deleteSalonImages, getAllSalons, changeSalonOnlineStatus, uploadSalonLogo, getSalonLogo, deleteSalonLogo, uploadSalonGallery, uploadMoreSalonGalleryImages, getSalonImages, updateSalonLogo,  } = require("../../controllers/admin/salonRegisterController")
const { handleProtectedRoute, changeDefaultSalonIdOfAdmin } = require("../../controllers/admin/adminRegisterController")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(handleProtectedRoute,getAllSalonsByAdmin) //api integrated

//CREATE SALON BY ADMIN
router.route("/createSalonByAdmin").post(handleProtectedRoute,createSalonByAdmin) //api integrated

//UPLOAD SALON IMAGE
router.route("/uploadSalonImage").post(handleProtectedRoute,uploadSalonGallery)

//UPLOAD MORE IMAGES TO THE EXISTING ARRAY OF IMAGES
router.route("/uploadMoreImages").post(handleProtectedRoute, uploadMoreSalonGalleryImages)

//UPDATE SALON IMAGES
router.route("/updateSalonImages").put(handleProtectedRoute,updateSalonImages)

//DELETE SALON IMAGES
router.route("/deleteSalonImages").delete(handleProtectedRoute, deleteSalonImages)
//DELETE SALON IMAGES
router.route("/getSalonImages").post(getSalonImages)

//UPDATE SALON BY ADMIN EMAIL AND SALON ID
router.route("/updateSalonBySalonIdAndAdminEmail").put(handleProtectedRoute,updateSalonBySalonIdAndAdminEmail)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByNameAndCity").post(searchSalonsByNameAndCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working



//GET ALL SALON SERVICES
router.route("/allSalonServices").get(handleProtectedRoute ,allSalonServices) //api working

router.route("/updateSalonServiceByServiceId").put(handleProtectedRoute,updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

//SOFT DELETE SALON
router.route("/deleteSalon").post(handleProtectedRoute,deleteSalon)

//GetAll Salons
router.route("/getAllSalons").get(handleProtectedRoute,getAllSalons)

//Change Salon online Status
router.route("/changeSalonOnlineStatus").post(handleProtectedRoute,changeSalonOnlineStatus )

//Upload Salon Logo
router.route("/uploadSalonLogo").post(uploadSalonLogo)

//Update Salon Logo
router.route("/updateSalonLogo").put(updateSalonLogo)

//Get Salon Logo
router.route("/getSalonLogo").post(getSalonLogo)

//Delete Salon Logo
router.route("/deleteSalonLogo").delete(deleteSalonLogo)


module.exports = router 