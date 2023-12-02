
const { validateSignUp } = require("../../middlewares/registerValidator");
const customerService = require("../../services/customer/customerRegisterService.js")
const Customer = require("../../models/customerRegisterModel.js")
const Appointment = require("../../models/appointmentsModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto");
const { sendVerificationCodeByEmail } = require("../../utils/emailSender");
// const { sendVerificationCodeToMobile } = require("../../utils/mobileMessageSender");



// Create a new customer
const signUp = async (req, res) => {
  try {
    const {
      email,
      name,
      userName,
      gender,
      dateOfBirth,
      mobileNumber,
      password,
    } = req.body;

//Creating verification code and hashed password
    const verificationCode = crypto.randomBytes(2).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    //Creating new Customer Object
    const customer = new Customer({
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

    if (savedCustomer.verificationCode) {
      const email = "arghyahimanstech@gmail.com"
      // Send verification code via email
      sendVerificationCodeByEmail(email, verificationCode);
      // sendVerificationCodeToMobile(mobileNumber, verificationCode)
      res.status(200).json({
          success: true,
          response: verificationCode,
          message: 'Customer saved and Verification code has been sent successfully',
        });
      
    } else {
      res.status(400).json({
        success: false,
        response: 'Failed to save customer and send verification code',
        message: 'Customer data could not be saved',
      });
    }
  }
catch (error) {
  console.error(error);
  res.status(500).json({
   success: false,
    error: 'Failed to create customer'
  });
}
};

const matchVerificationCode = async(req, res) =>{
  try{
    const { email, verificationCode} = req.body;

    // Find the customer
    const customer = await Customer.findOne({email})

      if(customer.verificationCode === verificationCode){
        customer.verificationCode = '';
        // customer.VerificationCode = ''; // Clear the verification code
        await customer.save();
       
        res.status(200).json({
          success: true,
          response: customer,
        });
      }
      res.status(201).json({
        success: false,
        response: "Verification Code didn't match",
        message: "Enter valid Verification code",
      }); 
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to match Verification Code',
    });
  }
}

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

const checkEmail = async(req, res) =>{
  try{
    const {email} = req.body;

    //Find existing email for a particular salonId
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      res.status(400).json({
        success: false,
        message: "This EmailId already exists",
      });
    }
    else{
      res.status(200).json({
        success: true,
        response: email,
      });
    }
  }
  catch(error){
    console.log(error.message)
    return {
      status: 500,
      error: 'Failed to create customer'
    };
  }
}

const getAppointmentForCustomer =  async(req, res)=> {
  try {
    const { customerEmail } = req.body;

    const customerAppointments = await Appointment.aggregate([
      {
        $match: {
          "appointmentList.customerEmail": customerEmail
        }
      },
      {
        $project: {
          appointments: {
            $filter: {
              input: "$appointmentList",
              as: "appointment",
              cond: {
                $eq: ["$$appointment.customerEmail", customerEmail]
              }
            }
          }
        }
      }
    ]);

    if (customerAppointments.length > 0 && customerAppointments[0].appointments.length > 0) {
      res.status(200).json({ appointments: customerAppointments[0].appointments });
    } else {
      res.status(404).json({ message: "No appointments found for the customer" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//CUSTOMER CONNECT SALON AFTER LOGIN
const customerConnectSalon = async(req, res) =>{
  try{
    const {email, salonId} = req.body;
//Find the Customer by emailId and add salon
    const customer = await Customer.findOneAndUpdate({email}, {salonId:salonId}, {new: true})
    //If customer is not found
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer is added to the salon",
      response: customer,
    });
}
catch (error) {
  // Handle errors that might occur during the operation
  res.status(500).json({
    success: false,
    message: "An error occurred while connecting customer to the salon",
    error: error.message,
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
  sendMailToCustomer,
  checkEmail,
  matchVerificationCode,
  getAppointmentForCustomer,
  customerConnectSalon
  }