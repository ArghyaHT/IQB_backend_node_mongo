
const customerService = require("../services/customerRegisterService")
// const {sendPasswordResetEmail} = require("../utils/emailSender.js")



// Create a new customer
const signUp = async (req, res) => {
try{
  const customerData = req.body;

  const result = await customerService.createCustomer(customerData);

  res.status(result.status).json({
   
    status: result.status,
    response: result.response,
    VerificationCode: result.VerificationCode
  });

  console.log(result.response)
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
    const {Email} = req.body;
    
    const result = await customerService.enterEmail(Email);

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





 

  module.exports ={
  signUp,
  signIn,
  forgetPassword,
  resetpassword
  
  }