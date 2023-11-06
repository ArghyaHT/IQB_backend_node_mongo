const Admin = require("../../models/adminRegisterModel.js")

// const bcrypt = require("bcrypt")

const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../../utils/emailSender.js");

// const createAdmin = async(adminData) => {
//     const {
//         email,
//         firstName,
//         lastName,
//         gender,
//         userName,
//         dateOfBirth,
//         mobileNumber,
//         password,
//       } = adminData;

//       try{
//         const existingAdmin = await Admin.findOne({ Email : email});

//         if (existingAdmin) {
//           return {
//             status: 400,
//             response: 'An admin with the provided email already exists',
//           };
//         }
//         const verificationCode = crypto.randomBytes(2).toString('hex');
//         const hashedPassword = await bcrypt.hash(password, 10);
    
//         //Save the customer
//         const admin = new Admin({
//           Email: email,
//           FirstName: firstName,
//           LastName: lastName,
//           UserName: userName,
//           Gender: gender,
//           DateOfBirth: dateOfBirth,
//           MobileNumber: mobileNumber,
//           Password: hashedPassword,
//           VerificationCode: verificationCode,
//         });
    
    
//         const savedadmin = await admin.save();
//         return {
//           status: 200,
//           response: savedadmin,
//           VerificationCode: verificationCode
//         }
//       }
//       catch (error) {
//         console.log(error.message)
//         return {
//           status: 500,
//           message: error.message
//         };
//       }

// }

// const signInAdmin = async(email, password) =>{
// try{
//   const admin = await Admin.findOne({Email: email});

//   if (!admin) {
//     return {
//       status: 400,
//       response: 'Email Id did not match',
//     };
//   }

//   const isPasswordValid = await bcrypt.compare(password, admin.Password);
//   if (!isPasswordValid) {
//     return {
//       status: 400,
//       response: 'Password did not match ',
//     }
//   }
//   return {
//     status: 200,
//     response: admin,
//   };
// }
// catch (error) {
//   console.log(error.message)
//   return {
//     status: 500,
//     message: 'Failed to Sign In'
//   };
// }
// }

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

    admin.VerificationCode = verificationCode;
    await admin.save();

    if (admin.VerificationCode) {
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

//Reset Password

// const matchVerificationCodeandResetAdminpassword = async (email, verificationCode, newPassword) => {
//   try {
//     // Find the customer by verification code
//     const admin = await Admin.findOne({ Email: email});
//     if (!admin) {
//       return {
//         status: 400,
//         response: 'admin with the emailId not found',
//       };
//     }

//     // Check if the new password and re-entered password match
//     if (newPassword.length < 8) {
//       return {
//         status: 400,
//         response: 'Password must be at least 8 characters long',
//       };
//     }


//     // Update the customer's password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     admin.Password = hashedPassword;
//     admin.VerificationCode = '';
//     // customer.VerificationCode = ''; // Clear the verification code
//     await admin.save();

//     // Return success message or any additional data as needed
//     return {
//       status: 200,
//       message: 'Password reset successfully'
//     };
//   } catch (error) {
//     console.error(error);
//     throw new Error('Failed to reset password');
//   }
// }

// const getAllAdmins = async() =>{
//   try{
//     const allAdmins = await Admin.find()
   
//     return {
//       status: 200,
//       response: allAdmins,
//     };
//   }

//   catch (error) {
//     console.log(error.message)
//     return {
//       status: 500,
//       message: 'Failed to Show Admins'
//     };
//   }
// }





const deleteAdmin = async(email) =>{

  try{
    const changeAdminStatus = await Admin.findOneAndUpdate({ email}, {isActive: false}, {new:true})

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



const updateAdmin = async(adminData) =>{
  const{salonId, name, gender, email, userName, mobileNumber,dateOfBirth, isActive} = adminData

  try{
    const admin = await Admin.findOneAndUpdate({email: email},
      {name: name, 
        salonId: salonId,
        userName: userName,
        gender: gender, 
        dateOfBirth: dateOfBirth,
         mobileNumber: mobileNumber, 
         isActive:isActive},
      {new: true})
      return {
        status: 200,
        response: admin,
      };
  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: 'Failed to Update Admin'
    };
  }
}


module.exports = {
// createAdmin,
// signInAdmin,
// getAllAdmins,
deleteAdmin,
updateAdmin,
enterAdminEmail,
// matchVerificationCodeandResetAdminpassword,

  }