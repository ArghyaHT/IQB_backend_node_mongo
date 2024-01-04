const Customer = require("../../models/customerRegisterModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto")

const { sendPasswordResetEmail, sendCustomerMail, sendVerificationCodeByEmail } = require("../../utils/emailSender.js")


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

    if (!isPasswordValid) {
      return {
        status: 400,
        response: 'Password did not match',
      };
    }

    // If both email and password are valid, return customer details
    return {
      status: 200,
      response: customer,
    };
  } catch (error) {
    throw new Error('Failed to sign in');
  }
};


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

//UPDATE CUSTOMER PROFILE
const updateCustomer = async (customerData) => {
  const {
    email,
    name,
    gender,
    dateOfBirth,
    password,
    mobileNumber,
  } = customerData;

  try {

      //Hashing the Password
      const hashedPassword = await bcrypt.hash(password, 10);

    const findCustomer = await Customer.findOneAndUpdate({ email },
      { name, gender, password:hashedPassword, dateOfBirth, mobileNumber },
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


//Send Mail to the Customer
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