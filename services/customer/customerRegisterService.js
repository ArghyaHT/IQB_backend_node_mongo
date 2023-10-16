const Customer = require("../../models/customerRegisterModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto")

const { sendPasswordResetEmail } = require("../../utils/emailSender.js")


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

    //Find the Customer If exits 
    const existingCustomer = await Customer.findOne({ email, salonId });

    if (existingCustomer) {
      return {
        status: 400,
        response: 'A customer with the provided email already exists',
      };
    }



    const verificationCode = crypto.randomBytes(2).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    //Save the customer
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

    // const token = await customer.generateAuthToken();

    const savedCustomer = await customer.save();
    return {
      status: 200,
      response: savedCustomer,
      VerificationCode: verificationCode
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

const enterEmail = async (email) => {
  try {
    const customer = await Customer.findOne({ Email: email });
    if (!customer) {
      return {
        status: 400,
        response: 'Email Id did not match',
      };
    }

    const verificationCode = crypto.randomBytes(2).toString('hex');

    customer.VerificationCode = verificationCode;
    await customer.save();

    if (customer.VerificationCode) {
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


const matchVerificationCodeandResetpassword = async (verificationCode, newPassword, reEnterPassword) => {
  try {
    // Find the customer by verification code
    const customer = await Customer.findOne({ VerificationCode: verificationCode });
    if (!customer) {
      return {
        status: 400,
        response: 'Verification Code did not match',
      };
    }

    // Check if the new password and re-entered password match
    if (newPassword.length < 8) {
      return {
        status: 400,
        response: 'Password must be at least 8 characters long',
      };
    }

    if (newPassword !== reEnterPassword) {
      return {
        status: 400,
        response: "Passwords do not match"
      };
    }

    // Update the customer's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.Password = hashedPassword;
    customer.VerificationCode = '';
    // customer.VerificationCode = ''; // Clear the verification code
    await customer.save();

    // Return success message or any additional data as needed
    return {
      status: 200,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to reset password');
  }
}


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



module.exports = {
  createCustomer,
  signInCustomer,
  enterEmail,
  matchVerificationCodeandResetpassword,
  // getAllCustomers,
  deleteCustomer,
  updateCustomer,
}