const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadProfile,
  deleteProfile,
  updateProfile,
} = require("../../controllers/ImageUploadDemo/student");

router.route("/").get(getStudents).post(createStudent);
router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);
router.route("/image").post(uploadProfile);
router.route("/image/delete").post(deleteProfile)
router.route("/image/update").put(updateProfile)
module.exports = router;