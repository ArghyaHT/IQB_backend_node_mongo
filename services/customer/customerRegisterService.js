const Customer = require("../../models/customerRegisterModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto")

const { sendPasswordResetEmail, sendCustomerMail, sendVerificationCodeByEmail } = require("../../utils/emailSender.js")


//----------SignUp For customer-----------------//
const createCustomer = async (customerData) => {
  try {
    const {
      salonId,
      email,
      name,
      userName,
      gender,
      dateOfBirth,
      mobileNumber,
      password,
    } = customerData;

    const verificationCode = crypto.randomBytes(2).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      salonId,
      email,
      name,
      userName,
      gender,
      dateOfBirth,
      mobileNumber,
      password: hashedPassword,
      verificationCode,
    });

    const savedCustomer = await customer.save();

    if (savedCustomer) {
      const email = "arghyahimanstech@gmail.com"
      // Send verification code via email
      const emailSent = sendVerificationCodeByEmail(email, verificationCode);

      if (emailSent) {
        return {
          status: 200,
          response: verificationCode,
          message: 'Verification code has been sent successfully',
        };
      } else {
        return {
          status: 500,
          response: 'Failed to send verification code',
          message: 'Verification code has not been sent',
        };
      }
    } else {
      return {
        status: 400,
        response: 'Failed to save customer',
        message: 'Customer data could not be saved',
      };
    }
  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      error: 'Failed to create customer'
    };
  }
}


//----------SignIn For customer-----------------//
const signInCustomer = async (email, password) => {
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return {
        status: 400,
        response: 'Email Id did not match',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    // const token = await customer.generateAuthToken();
    // console.log("the token part" + token)

    if (!isPasswordValid) {
      return {
        status: 400,
        response: 'Password did not match ',
      }
    }
    return {
      status: 200,
      response: customer,
    };
  } catch (error) {
    throw new Error('Failed to sign in');
  }
};


//Forget Password
// const enterEmail = async (email) => {
//   try {
//     const user = await Customer.findOne({ email: email });
//     if (!user) {
//       return {
//         status: 404,
//         response: "Admin with this email does not exist.Please register first",
//       };
//     }

//     const verificationCode = crypto.randomBytes(2).toString('hex');

//     const emailData = {
//       email,
//       subject: 'Reset Password Email',
//       html: `
//           <h2>Hello ${user.name}!</h2>
//           <p>Your Password Reset Verification Code is ${verificationCode}
         
//       `
//   };
//     await user.save();
//     try {
//       await sendPasswordResetEmail(emailData)
//   } catch (error) {
//       res.status(500).json({
//           success: false,
//           message: 'Failed to send reset password email'
//       })
//   }

//   res.status(200).json({
//     success: true,
//     message: `Please go to your ${email} for reseting the password`,
//     payload: {
//         resetToken
//     }
// })
//   } catch (error) {
//     console.error('Failed to enter email:', error);
//     throw new Error('Failed to sign in');
//   }
// };


// const matchVerificationCodeandResetpassword = async (verificationCode, newPassword, reEnterPassword) => {
//   try {
//     // Find the customer by verification code
//     const customer = await Customer.findOne({ verificationCode: verificationCode });
//     if (!customer) {
//       return {
//         status: 400,
//         response: 'Verification Code did not match',
//       };
//     }

//     // Check if the new password and re-entered password match
//     if (newPassword.length < 8) {
//       return {
//         status: 400,
//         response: 'Password must be at least 8 characters long',
//       };
//     }

//     if (newPassword !== reEnterPassword) {
//       return {
//         status: 400,
//         response: "Passwords do not match"
//       };
//     }

//     // Update the customer's password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     customer.password = hashedPassword;
//     customer.verificationCode = '';
//     // customer.VerificationCode = ''; // Clear the verification code
//     await customer.save();

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


// const getAllCustomers = async () => {
//   try {
//     const allCustomers = await Customer.find({})

//     return {
//       status: 200,
//       response: allCustomers,
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

const deleteCustomer = async (email) => {
  try {
    const customer = await Customer.findOne({ email })
    const deletedCustomer = customer.deleteOne();
    return {
      status: 200,
      response: deletedCustomer,
    };
  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: 'Failed to Delete Customer'
    };
  }
}

const updateCustomer = async (customerData) => {
  const {
    email,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    mobileNumber,
  } = customerData;

  try {
    const findCustomer = await Customer.findOneAndUpdate({ email },
      { firstName, lastName, gender, dateOfBirth, mobileNumber },
      { new: true })
    return {
      status: 200,
      response: findCustomer,
    };
  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: 'Failed to Update Customer'
    };
  }
}


const sendMail = async(email, subject, text) =>{

  try{
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return {
        status: 400,
        response: 'Email Id did not match',
      };
    }
    if(customer){
      sendCustomerMail(email, subject, text)


      return {
        status: 200,
        message: 'Mail has been sent Successfully',
      };

    }
    
  }
  catch (error) {
    console.error('Failed to enter email:', error);
    throw new Error('Failed to sign in');
  }
}


module.exports = {
  // createCustomer,
  signInCustomer,
  // enterEmail,
  // matchVerificationCodeandResetpassword,
  // getAllCustomers,
  deleteCustomer,
  updateCustomer,
  sendMail,
}