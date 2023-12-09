
const { validateSignUp } = require("../../middlewares/registerValidator");
const customerService = require("../../services/customer/customerRegisterService.js")
const Customer = require("../../models/customerRegisterModel.js")
const Appointment = require("../../models/appointmentsModel.js")

const bcrypt = require("bcrypt")

const crypto = require("crypto");
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');

const { sendVerificationCodeByEmail, sendPasswordResetEmail } = require("../../utils/emailSender");
// const { sendVerificationCodeToMobile } = require("../../utils/mobileMessageSender");

const JWT_ACCESS_SECRET = "accessToken"
const JWT_REFRESH_SECRET = "refreshToken"

//CHECK WEATHER THE EMAIL ALREADY EXISTS IN THE DATABASE-------
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

// SIGNUP A NEW CUSTOMER WHEN THE NEW EMAIL 
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

 //CREATING THE VERIFICATION CODE 
    const verificationCode = crypto.randomBytes(2).toString('hex'); //RANDOM 4 DIGHT GENERATED VERIFICATION CODE
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
      customer: true
    });

    const savedCustomer = await customer.save();

    if (savedCustomer.verificationCode) {

  
      // SEND VERIFICATION CODE TO TO THE REGISTERED EMAIL
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

// const signUp = async (req, res) => {
//   try {
//     const {
//       email,
//       name,
//       userName,
//       gender,
//       dateOfBirth,
//       mobileNumber,
//       password,
//     } = req.body;

//     // Creating verification code and hashed password
//     const verificationCode = crypto.randomBytes(2).toString('hex');
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Creating new Customer Object
//     const customer = new Customer({
//       email,
//       name,
//       userName,
//       gender,
//       dateOfBirth,
//       mobileNumber,
//       password: hashedPassword,
//       verificationCode,
//     });

//     const savedCustomer = await customer.save();

//     if (savedCustomer.verificationCode) {
//       // Generating JWT token for the newly signed-up customer
//       const tokenPayload = {
//         customerId: savedCustomer._id, // Assuming _id is the unique identifier for the customer
//         email: savedCustomer.email,
//       };

//       // Generating access token for the customer
//       const accessToken = jwt.sign(tokenPayload, JWT_ACCESS_SECRET, { expiresIn: '24h' });

//       // Send verification code via email
//       const emailForVerification = "arghyahimanstech@gmail.com";
//       sendVerificationCodeByEmail(emailForVerification, verificationCode);
      
//       res.status(200).json({
//         success: true,
//         response: {
//           verificationCode,
//           accessToken, // Send the generated access token in the response
//         },
//         message: 'Customer saved and Verification code has been sent successfully',
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         response: 'Failed to save customer and send verification code',
//         message: 'Customer data could not be saved',
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create customer',
//     });
//   }
// };

const matchVerificationCode = async(req, res) =>{
  try{
    const { email, verificationCode} = req.body;

    // FIND THE CUSTOMER 
    const customer = await Customer.findOne({email})

    //MATCH THE VERIFICATION CODE AND CLEAR IT FROM THE DATABASE IF MATCHED
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

// const matchVerificationCode = async (req, res) => {
//   try {
//     const { accessToken, verificationCode } = req.body;

//     // Verify the provided access token
//     jwt.verify(accessToken, JWT_ACCESS_SECRET, async (err, decoded) => {
//       if (err) {
//         return res.status(401).json({
//           success: false,
//           response: "Invalid or expired access token",
//           message: "Please provide a valid access token"
//         });
//       }

//       const customerId = decoded.customerId; // Extract customer ID from the decoded token

//       // Find the customer using the extracted ID
//       const customer = await Customer.findById(customerId);

//       if (customer) {
//         // Match the verification code
//         if (customer.verificationCode === verificationCode) {
//           // Clear the verification code
//           customer.verificationCode = '';
//           await customer.save();

//           res.status(200).json({
//             success: true,
//             response: "Verification successful",
//             customer
//           });
//         } else {
//           res.status(400).json({
//             success: false,
//             response: "Verification code didn't match",
//             message: "Please enter a valid verification code"
//           });
//         }
//       } else {
//         res.status(404).json({
//           success: false,
//           response: "Customer not found",
//           message: "No customer found for provided access token"
//         });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: 500,
//       error: 'Failed to match Verification Code',
//     });
//   }
// }


// //DESC OF LOGIN OF THE CUSTOMER----
// const signIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await Customer.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_ACCESS_SECRET, { expiresIn: '20s' });
//     const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "10m" });

//     return res.status(200).json({
//       success: true,
//       message: "Customer signed in successfully",
//       response: {
//         accessToken,
//         refreshToken,
//         user: { userId: user._id, email: user.email }
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       error: 'Failed to sign in',
//     });
//   }
// };
//--------Forget Password------//

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        response: "Admin with this email does not exist. Please register first",
      });
    }

    const verificationCode = crypto.randomBytes(2).toString('hex');
    const responseToken = crypto.createHash('sha256')
      .update(email + verificationCode + JWT_REFRESH_SECRET)
      .digest('hex')
      .slice(0, 10); 
    const emailData = {
      email,
      subject: 'Reset Password Email',
      html: `
        <h2>Hello ${user.name}!</h2>
        <p>Your Password Reset Verification Code is ${verificationCode}</p>
      `
    };

    user.verificationCode = verificationCode;
    await user.save();

    try {
      await sendPasswordResetEmail(emailData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset password email',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Please check your email (${email}) for resetting the password`,
      verificationCode: verificationCode,
      token: responseToken
    });
  } catch (error) {
    console.error('Failed to handle forget password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate password reset',
      error: error.message
    });
  }
};

const verifyPasswordResetCode = async (req, res) => {
  try {
      const { email, verificationCode, } = req.body;

      const user = await Customer.findOne({ email });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found",
          });
      }

      if(user.verificationCode === verificationCode){
        user.verificationCode = '';
        // customer.VerificationCode = ''; // Clear the verification code
        await user.save();
       
        res.status(200).json({
          success: true,
          message: "Verification Code successfully matched",
          email: email,
        });
      } else {
          // Verification code doesn't match
          return res.status(400).json({
              success: false,
              message: "Invalid verification code",
          });
      }
  } catch (error) {
      console.error('Failed to verify password reset code:', error);
      return res.status(500).json({
          success: false,
          message: 'Failed to verify password reset code',
          error: error.message
      });
  }
};


const resetpassword = async (req, res) => {
  try {
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await Customer.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Reset Password Token is invalid or has been expired"
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const googleLoginControllerCustomer = async (req, res) => {
  try {
      const CLIENT_ID = process.env.CLIENT_ID;
      const token = req.body.token;

      if (!token) {
          return res.status(401).json({ success: false, message: "UnAuthorized User or Invalid User" });
      }

      const client = new OAuth2Client(CLIENT_ID);
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { name, email } = payload;

      let user = await Customer.findOne({ email });

      if (!user) {
          // If the user doesn't exist, create a new user
          user = new Customer({ name, email, customer: true, AuthType: "google" });
          await user.save();
      }

      const accessToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "20s" });
      const refreshToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "10m" });

      res.status(200).json({
          success: true,
          message: "Customer signed in successfully",
          tokens: { accessToken, refreshToken }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to sign in' });
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

const getCustomerDetails = async(req, res) => {
try{
  const {email} = req.body;
  const customer = await Customer.findOne({ email }).select('-password');
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Customer details found successfully",
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
  customerConnectSalon,
  googleLoginControllerCustomer,
  verifyPasswordResetCode,
  getCustomerDetails
  }