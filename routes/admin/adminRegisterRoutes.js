const express = require("express");
const { validateSignUp, validate } = require("../../middlewares/registerValidator");
const { adminSignUp, adminSignIn, allAdmins, deleteSingleAdmin, updateAdmin, forgetAdminPassword, resetAdminpassword } = require("../../controllers/admin/adminRegisterController.js");


const router = express.Router();

router.route("/adminSignUp").post(validateSignUp, validate, adminSignUp)

router.route("/getAllAdmins").get(allAdmins)

router.route("/deleteAdmin").delete(deleteSingleAdmin)

router.route("/updateAdmin").put(validateSignUp, validate, updateAdmin)

router.route("/forgetAdminPassword").post(forgetAdminPassword)

router.route("/resetAdminPassword").post(resetAdminpassword)




module.exports = router
