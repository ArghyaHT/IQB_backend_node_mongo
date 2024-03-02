const express = require("express")
const {  getSalonInfo, updateSalonBySalonIdAndAdminEmail, allSalonServices, updateSalonServiceByServiceId, deleteServiceByServiceIdSalonId, getSalonsByLocation, addServices, getAllSalonsByAdmin, searchSalonsByNameAndCity, deleteSalon, createSalonByAdmin, updateSalonImages, deleteSalonImages, getAllSalons, changeSalonOnlineStatus, uploadSalonLogo, getSalonLogo, deleteSalonLogo, uploadSalonGallery, uploadMoreSalonGalleryImages, getSalonImages, updateSalonLogo,  } = require("../../controllers/admin/salonRegisterController")
const { changeDefaultSalonIdOfAdmin, isLogginMiddleware, handleAdminProtectedRoute } = require("../../controllers/admin/adminRegisterController")
const { handleBarberProtectedRoute } = require("../../controllers/barber/barberRegisterController")
const verifyRefreshTokenAdmin = require("../../middlewares/Admin/VerifyRefreshTokenAdmin")


const router = express.Router()

router.route("/getAllSalonsByAdminEmail").get(verifyRefreshTokenAdmin,getAllSalonsByAdmin) //api integrated

//CREATE SALON BY ADMIN
router.route("/createSalonByAdmin").post(verifyRefreshTokenAdmin,createSalonByAdmin) //api integrated

//UPLOAD SALON IMAGE
router.route("/uploadSalonImage").post(verifyRefreshTokenAdmin,uploadSalonGallery)

//UPLOAD MORE IMAGES TO THE EXISTING ARRAY OF IMAGES
router.route("/uploadMoreImages").post(verifyRefreshTokenAdmin, uploadMoreSalonGalleryImages)

//UPDATE SALON IMAGES
router.route("/updateSalonImages").put(verifyRefreshTokenAdmin,updateSalonImages)

//DELETE SALON IMAGES
router.route("/deleteSalonImages").delete(verifyRefreshTokenAdmin, deleteSalonImages)
//DELETE SALON IMAGES
router.route("/getSalonImages").post(getSalonImages)

//UPDATE SALON BY ADMIN EMAIL AND SALON ID
router.route("/updateSalonBySalonIdAndAdminEmail").put(verifyRefreshTokenAdmin,updateSalonBySalonIdAndAdminEmail)

// router.route("/addSalonServices").post(addServices)

router.route("/searchByNameAndCity").post(searchSalonsByNameAndCity)

router.route("/getSalonsByLocation").get(getSalonsByLocation) //api working

router.route("/getSalonInfoBySalonId").get(getSalonInfo) // api working

router.route("/updateSalonServiceByServiceId").put(verifyRefreshTokenAdmin,updateSalonServiceByServiceId) //api working perfectly

router.route("/deleteServiceByServiceIdSalonId").post(deleteServiceByServiceIdSalonId)

//SOFT DELETE SALON
router.route("/deleteSalon").post(verifyRefreshTokenAdmin,deleteSalon)

//GetAll Salons
router.route("/getAllSalons").get(verifyRefreshTokenAdmin,getAllSalons)

//Change Salon online Status
router.route("/changeSalonOnlineStatus").post(verifyRefreshTokenAdmin,changeSalonOnlineStatus )

//Upload Salon Logo
router.route("/uploadSalonLogo").post(verifyRefreshTokenAdmin, uploadSalonLogo)

//Update Salon Logo
router.route("/updateSalonLogo").put(verifyRefreshTokenAdmin, updateSalonLogo)

//Get Salon Logo
router.route("/getSalonLogo").post(getSalonLogo)

//Delete Salon Logo
router.route("/deleteSalonLogo").delete(deleteSalonLogo)

module.exports = router 