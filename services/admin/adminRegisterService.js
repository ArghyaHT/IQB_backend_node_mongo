const Admin = require("../../models/adminRegisterModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../../utils/emailSender.js");

//Forget Email
const enterAdminEmail = async (email) => {
  try {
    const admin = await Admin.findOne({ Email: email });
    if (!admin) {
      return {
        status: 400,
        response: 'Email Id did not match',
      };
    }

    const verificationCode = crypto.randomBytes(2).toString('hex');

    admin.verificationCode = verificationCode;
    await admin.save();

    if (admin.verificationCode) {
      const email = "bikkihimanstech@gmail.com"

      const resetLink = "`https://gmail.com/reset-password`"

      sendPasswordResetEmail(email, resetLink);

      return {
        status: 200,
        response: verificationCode,
        message: 'Verification code has been sent successfully',
      };
    }

    return {
      status: 400,
      response: error,
      message: 'Verification code has not been sent',
    };
  } catch (error) {
    console.error('Failed to enter email:', error);
    throw new Error('Failed to sign in');
  }
};


const deleteAdmin = async (email) => {

  try {
    const changeAdminStatus = await Admin.findOneAndUpdate({ email }, { isActive: false }, { new: true })

    return {
      status: 200,
      response: changeAdminStatus,
    };
  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: 'Failed to Delete Admin'
    };
  }
}


//Update Admin Account Details
const updateAdmin = async (adminData) => {
  const { name, gender, email, mobileNumber, dateOfBirth, password } = adminData;

  try {
    let updateFields = {
      name,
      gender,
      dateOfBirth,
      mobileNumber,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const admin = await Admin.findOneAndUpdate({ email }, updateFields, { new: true }).select("-password");

    if (!admin) {
      console.log("Admin not found or no changes made.");
      return {
        status: 404,
        message: 'Admin not found or no changes made.',
      };
    }

    return {
      status: 200,
      response: admin,
    };
  } catch (error) {
    console.error(error.message);
    return {
      status: 500,
      message: 'Failed to Update Admin',
      error: error.message,
    };
  }
};

module.exports = {
  deleteAdmin,
  updateAdmin,
  enterAdminEmail,
}