const express = require("express");
const { validateSignUp, validate } = require("../../middlewares/registerValidator");
const { adminSignUp, allAdmins, deleteSingleAdmin, updateAdmin, forgetAdminPassword, resetAdminpassword, adminLogin } = require("../../controllers/admin/adminRegisterController.js");
const {auth} = require("../../utils/AuthUser");

const router = express.Router();

// router.route("/adminSignUp").post(validateSignUp, validate, adminSignUp)

router.route("/login").post(auth, adminLogin)

// router.route("/getAllAdmins").get(allAdmins)

router.route("/deleteAdmin").post(auth, deleteSingleAdmin)

router.route("/updateAdmin").put(auth, updateAdmin)




// router.route("/forgetAdminPassword").post(forgetAdminPassword)

// router.route("/resetAdminPassword").post(resetAdminpassword)

module.exports = router
