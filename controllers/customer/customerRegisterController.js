
const { validateSignUp } = require("../../middlewares/registerValidator");
const customerService = require("../../services/customer/customerRegisterService.js")


// Create a new customer
const signUp = async (req, res) => {
try{
  const customerData = req.body;

  validateSignUp[req]

  const result = await customerService.createCustomer(customerData);

  res.status(result.status).json({
   
    status: result.status,
    response: result.response,
    VerificationCode: result.VerificationCode
  });

}
catch (error) {
  console.error(error);
  res.status(500).json({
    status: 500,
    error: 'Failed to create customer'
  });
}
};


//-----------SignIn Customer-------------//
const signIn = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const result = await customerService.signInCustomer(Email, Password);

    res.status(result.status).json({
      status: result.status,
      response: result.response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to sign in',
    });
  }
};


//--------Forget Password------//

const forgetPassword = async(req, res) =>{
  try{
    const {email} = req.body;
    
    const result = await customerService.enterEmail(email);

    res.status(result.status).json({
      status:result.status,
      response:result.response,
      message: result.message
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to sign in',
    });
  }
}


const resetpassword = async (req, res) => {
  try {
    const { VerificationCode, NewPassword, ReEnterPassword } = req.body;

    
    const result = await customerService.matchVerificationCodeandResetpassword(VerificationCode, NewPassword, ReEnterPassword);

    res.status(200).json({
      status: 200,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to reset password',
    });
  }
};



const allCustomers = async(req, res) => {
  try{
      const result = await customerService.getAllCustomers()

      res.status(result.status).json({

          status: result.status,
          response: result.response,
      });
  }
  catch (error) {
      console.error(error);
      res.status(500).json({
          status: 500,
          message: 'Failed to Show Admins'
      });
  }
}

const deleteSingleCustomer = async(req, res) =>{
  const {email} = req.body;
  try{
      const result = await customerService.deleteCustomer(email)
      res.status(result.status).json({

          status: result.status,
          response: result.response,
      });
  }
  
  catch (error) {
      console.error(error);
      res.status(500).json({
          status: 500,
          message: 'Failed to Delete Customer'
      });
  }
}

const updateCustomer = async(req, res) =>{
  const customerData = req.body;
  validateSignUp[req]
  try {
      const result = await customerService.updateCustomer(customerData);
      res.status(result.status).json({

          status: result.status,
          response: result.response,
      });
  }
  catch (error) {
      console.error(error);
      res.status(500).json({
          status: 500,
          message: 'Failed to update Customer'
      });
  }
}


  module.exports = {
  signUp,
  signIn,
  forgetPassword,
  resetpassword,
  allCustomers,
  deleteSingleCustomer,
  updateCustomer
  
  }