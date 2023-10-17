
const { validateSignUp } = require("../../middlewares/registerValidator");
const customerService = require("../../services/customer/customerRegisterService.js")
const Customer = require("../../models/customerRegisterModel.js")


// Create a new customer
const signUp = async (req, res) => {
try{
  const customerData = req.body;

  validateSignUp[req]

  const result = await customerService.createCustomer(customerData);

  res.status(result.status).json({
    success:true,
    response: result.response,
    VerificationCode: result.VerificationCode
  });

}
catch (error) {
  console.error(error);
  res.status(500).json({
   success: false,
    error: 'Failed to create customer'
  });
}
};


//-----------SignIn Customer-------------//
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await customerService.signInCustomer(email, password);

    res.status(result.status).json({
      success: true,
      response: result.response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
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
  try {
    // const getAllBarbers = await Barber.find({salonId: salonId})

    const { salonId, name, email, page = 1, limit = 3, sortField, sortOrder } = req.query
    let query = {}

    const searchRegExpName = new RegExp('.*' + name + ".*", 'i')
    const searchRegExpEmail = new RegExp('.*' + email + ".*", 'i')

    if (salonId) {
      query.salonId = salonId
    }

    if (name || email) {
      query.$or = [
        { name: { $regex: searchRegExpName } },
        { email: { $regex: searchRegExpEmail } }
      ];
    }

    const sortOptions = {};
    if (sortField && sortOrder) {
      sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = Number(page - 1) * Number(limit)

    const getAllCustomers = await Customer.find(query).sort(sortOptions).skip(skip).limit(Number(limit))

    const totalCustomers = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All Customers fetched successfully",
      getAllCustomers,
      totalPages: Math.ceil(totalCustomers / Number(limit)),
      currentPage: Number(page),
      totalCustomers,
    })

  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: error.message,
    };
  }
}

const updateCustomer = async(req, res) =>{
  const customerData = req.body;
  validateSignUp[req]
  try {
      const result = await customerService.updateCustomer(customerData);
      res.status(result.status).json({
         success: true,
          response: result.response,
      });
  }
  catch (error) {
      console.error(error);
      res.status(500).json({
          success:false,
          message: 'Failed to update Customer'
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


const sendMailToCustomer = async(req, res) =>{
  const { email, subject, text } = req.body;

  try {
    const result = await customerService.sendMail(email, subject, text);
    res.status(result.status).json({
       success: true,
        response: result.response,
        message: result.message,
    });
}
catch (error) {
    console.error(error);
    res.status(500).json({
        success:false,
        message: 'Failed to send mail'
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
  updateCustomer,
  sendMailToCustomer
  
  }