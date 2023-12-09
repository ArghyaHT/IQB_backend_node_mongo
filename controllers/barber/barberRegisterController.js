const barberService = require("../../services/barber/barberRegisterService.js")
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
// const User = require("../model/UserModel");
const emailWithNodeMail = require('../../utils/nodeMailer.js');
const crypto = require("crypto");
const bcrypt = require("bcrypt")

const Barber = require("../../models/barberRegisterModel.js")


const JWT_ACCESS_SECRET = "accessToken"
const JWT_REFRESH_SECRET = "refreshToken"

//Upload Profile Picture Config
const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dfrw3aqyp',
    api_key: '574475359946326',
    api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});


//DESC:REGISTER A Barber 
//====================
const registerController = async (req, res) => {
  try {
      const email = req.body.email
      const password = req.body.password

      let user = await Barber.findOne({ email: email });

      const barberId = await Barber.countDocuments() + 1;
      // If the user doesn't exist, create a new Barber
      if (!user) {
          // Hash the password before saving it
          const hashedPassword = await bcrypt.hash(password, 10);

          user = new Barber({
              email: email,
              password: hashedPassword,
              barberId: barberId,
              barber: true
          });
          await user.save();
      }

      res.status(200).json({
          success: true,
          message: "User registered successfully",
          user
      })
  } catch (error) {
      res.status(400).json({
          success: false,
          message: "Failed to create user",
          error: error.message
      })
  }
}

//DESC:LOGIN A USER =========================
const loginController = async (req, res) => {
  try {
      const email = req.body.email;
      const password = req.body.password;

      // Find user by email in the MongoDB database
      const user = await Barber.findOne({ email: email });

      // If user not found or password is incorrect, return unauthorized
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ success: false, message: "Invalid Credentials" });
      }

      // Generate tokens
      const accessToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "20s" });
      const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "10m" });

      // Set cookies in the response
      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true, 
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        secure: true,
        sameSite: "None"
      }); 

      res.cookie('accessToken', accessToken, {
         httpOnly: true, 
        expires: new Date(Date.now() + 20 * 1000),// 20 seconds
        secure: true,
        sameSite: "None" 
      }); 

      res.status(201).json({
          success: true,
          message: "Barber signed in successfully"
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: error.message
      });
  }
};


//GOOGLE SIGNIN ===================================
const googleLoginController = async (req, res) => {
  const CLIENT_ID = process.env.CLIENT_ID;
  const token = req.body.token;

  if (!token) {
      res.json({ message: "UnAuthorized User or Invalid User" })
  }

  const client = new OAuth2Client(CLIENT_ID);

  // Call the verifyIdToken to
  // varify and decode it
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
  });

  // Get the JSON with all the user info
  const payload = ticket.getPayload();

  let user = await Barber.findOne({ email: payload.email,AuthType:"google"});

  const barberId = await Barber.countDocuments() + 1;
  // If the user doesn't exist, create a new user
  // add barber id by count docuents and isApproved as false 
  if (!user) {
      user = new Barber({
          name: payload.name,
          email: payload.email,
          barberId: barberId,
          barber:true,
          AuthType:"google"
      });
      await user.save();
  }

  else if (user) {
      const accessToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "20s" });
      const refreshToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "10m" });


        // Set cookies in the response
        res.cookie('refreshToken', refreshToken, {
           httpOnly: true, 
           expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
           secure: true,
           sameSite: "None"  }); 
        res.cookie('accessToken', accessToken, { 
          httpOnly: true,
           expires: new Date(Date.now() + 20 * 1000), // 20 seconds
           secure: true,
           sameSite: "None" 
           }); 


        res.status(201).json({ 
          success:true,
          message:"User signed in successfully" 
      })
  } else {
      res.status(401).json({ success: false, message: "Invalid Credentials" })
  }
}

//DESC:REFRESH TOKEN ==============================
const refreshTokenController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not provided." });
  }

  try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      const newAccessToken = jwt.sign({ user: decoded.user }, JWT_ACCESS_SECRET, { expiresIn: "20s" });

      // Set the new access token as an HTTP-only cookie
      res.cookie('accessToken', newAccessToken, {
         httpOnly: true,
          expires: new Date(Date.now() + 20 * 1000), // 20 seconds
          secure: true,
          sameSite: "None"  });

      res.status(201).json({ success: true, message: "New accessToken generated" });
  } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
}

//DESC:LOGOUT A USER ========================
const handleLogout = async(req,res,next) => {
  try {
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')

      res.status(200).json({
          success:true,
          message:"Barber logged out successfully"
      })
  } catch (error) {
      res.status(500).json({
          success:false,
          message:error
      })
  }
}

//DESC:FORGOT PASSWORD SENDING EMAIL TO USER ===========
const handleForgetPassword = async (req, res, next) => {
  try {
      const { email } = req.body

      const user = await Barber.findOne({ email: email })

      if (!user) {
          throw createError(404, "User with this email does not exist.Please register first")
      }

      //get ResetPassword Token
      const resetToken = user.getResetPasswordToken()

      await user.save({ validatebeforeSave: false })

      const CLIENT_URL = "http://localhost:5173"

      //prepare email
      const emailData = {
          email,
          subject: 'Reset Password Email',
          html: `
              <h2>Hello ${user.name}!</h2>
              <p>Please click here to link <a style="background-color: #c2e7ff; padding: 8px 12px; border-radius: 15px; color: white; text-decoration: none; border: none; margin-left:10px;color:black;font-weigth:bold" href="http://localhost:5173/resetpassword/${resetToken}" target="_blank">Reset your password</a></p>
          `
      };

      try {
          await emailWithNodeMail(emailData)
      } catch (error) {
          res.status(500).json({
              success: false,
              message: 'Failed to send reset password email'
          })
      }

      res.status(200).json({
          success: true,
          message: `Please go to your ${email} for reseting the password`,
          payload: {
              resetToken
          }
      })
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
      })
  }
}


//DESC:RESET PASSWORD =================================
const handleResetPassword = async (req, res, next) => {
  try {
      //creating token hash
      const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

      const user = await Barber.findOne({
          resetPasswordToken: resetPasswordToken, resetPasswordExpire: {
              $gt: Date.now()
          }
      })

      if (!user) {
          res.status(404).json({
              success: false,
              message: "Reset Password Token is invalid or has been expired"
          })
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save()

      res.status(200).json({
          success: true,
          message: 'Password reset successfully'
      })

  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
      })
  }
}


//MIDDLEWARE FOR ALL PROTECTED ROUTES ==================
const handleProtectedRoute = async (req, res, next) => {
  try {
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;

      if(!refreshToken){
          return res.status(403).json({
              success: false,
              message: "Refresh Token not present.Please Login Again",
          });
      }

      // Verify old refresh token
      const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

      if (!decodeToken) {
          return res.status(401).json({
              success: false,
              message: "Invalid Access Token. UnAuthorize User",
          });
      }

      req.user = decodeToken.user;
      next();
  } catch (error) {
      //This Error is for access Token getting expired or JWT must be provided
      if(error.message == "jwt must be provided"){
          res.status(500).json({
              success: false,
              message: error,
          });
      }else{
          return res.json({
              success: false,
              message: error,
          });
      }  
  }

};

//PROETCTED ROUTE =============================
const profileController = async (req, res) => {
  const user = req.user;

  res.status(200).json({
      success: true,
      message: "Protected Resources accessed successfully.",
      user,
  });
};

const insertDetailsByBarber= async (req, res) => {
  try {
    const barberData = req.body;

    const result = await barberService.insertBarberDetails(barberData);

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response,

    });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Barber',

    });
  }
}


//DESC Create Barber By Admin
const createBarberByAdmin = async(req, res) =>{
  try{
    const {email, name, userName, mobileNumber, dateOfBirth, password } = req.body;

    //Find the barber if present
    const barber = await Barber.findOne({email})

    if(barber){
      res.status(404).json({
        success:false,
        message: "Barber with the EmailId already exists. Please enter Other Email"
      })
    }
    else{
      //Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);
      //creating the barberId
      const barberId = await Barber.countDocuments() + 1;
      //Creating the barberCode
      const firstTwoLetters = name.slice(0, 2).toUpperCase();
      const barberCode = firstTwoLetters + barberId;

      //creating the barber document
      const barber = new Barber({
        email,
        password: hashedPassword,
        name,
        userName,
        mobileNumber,
        dateOfBirth,
        isApproved: true,
        barberCode:barberCode,
        barberId: barberId,
        isActive: true
      })

      //Saving the Salon
      const savedBarber = await barber.save();
      res.status(404).json({
        success:true,
        message: "Barber SuccessFully Created",
        response: savedBarber
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create barber',
      error: error.message
    });
  }
}

//DESC Update BarberBy Admin
const updateBarberByAdmin = async(req, res) =>{
  try{
  const {email, name, userName, mobileNumber, dateOfBirth } = req.body;

  const updatedBarber = await Barber.findOneAndUpdate({email}, {name, userName, mobileNumber, dateOfBirth}, {new: true});

  res.status(200).json({
    success:true,
    message: "Barber has been successfully updated",
    response: updatedBarber
  })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to Update barber',
      error: error.message
    });
  }

}

//Upload Barber profile Picture
const uploadBarberprofilePic = async(req, res) => {
  try {
    let profiles = req.files.profile;
    const email = req.body.email;

    // Ensure that profiles is an array, even for single uploads
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const uploadPromises = [];

    for (const profile of profiles) {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          const public_id = `${profile.name.split(".")[0]}`;

          cloudinary.uploader.upload(profile.tempFilePath, {
            public_id: public_id,
            folder: "students",
          })
            .then((image) => {
              resolve({
                public_id: image.public_id,
                url: image.secure_url, // Store the URL
              });
            })
            .catch((err) => {
              reject(err);
            })
            .finally(() => {
              // Delete the temporary file after uploading
              fs.unlink(profile.tempFilePath, (unlinkError) => {
                if (unlinkError) {
                  console.error('Failed to delete temporary file:', unlinkError);
                }
              });
            });
        })
      );
    }

    Promise.all(uploadPromises)
      .then(async (profileimg) => {
        console.log(profileimg);

        const barberImage = await Barber.findOneAndUpdate({email},{ profile: profileimg}, {new: true});

        res.status(200).json({
          success: true,
          message: "Files Uploaded successfully",
          barberImage
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Cloudinary upload failed" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const getAllBarberbySalonId = async (req, res) => {
  try {
    const { salonId, name, email, page = 1, limit = 3, sortField, sortOrder } = req.query;
    let query = { isDeleted: false }; // Filter for isDeleted set to false

    const searchRegExpName = new RegExp('.*' + name + ".*", 'i');
    const searchRegExpEmail = new RegExp('.*' + email + ".*", 'i');

    if (salonId) {
      query.salonId = salonId;
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

    const skip = Number(page - 1) * Number(limit);

    const getAllBarbers = await Barber.find(query).sort(sortOptions).skip(skip).limit(Number(limit));

    const totalBarbers = await Barber.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All barbers fetched successfully",
      getAllBarbers,
      totalPages: Math.ceil(totalBarbers / Number(limit)),
      currentPage: Number(page),
      totalBarbers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBarberAccountDetails = async (req, res) => {
  const barberData = req.body;
  try {
    const result = await barberService.updateBarberByEmail(barberData)

    res.status(result.status).json({
      success: true,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to Update Barber'
    });
  }
}

const deleteBarber = async (req, res) => {
  const { salonId } = req.query;
  const {email} = req.body
  try {
    const result = await barberService.deleteBarberByEmail(salonId, email);

    res.status(result.status).json({
      success:true,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to Update Barber'
    });
  }
}

const chnageBarberWorkingStatus = async(req, res) => {
  try {
    const { barberId } = req.params;
    const { isActive } = req.body;

    // Update the isActive status in the database
    const updatedBarber = await Barber.findOneAndUpdate(barberId, { isActive }, { new: true });

    if (!updatedBarber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    return res.status(200).json(updatedBarber);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  
}

const isBarberOnline = async(req, res) =>{
  try {
      const { barberId, salonId } = req.query;
      const { isOnline } = req.body;
  
      const updatedBarber = await Barber.findOneAndUpdate({barberId: barberId, salonId:salonId}, { isOnline }, { new: true });
  
      if (!updatedBarber) {
        return res.status(404).json({ message: "Barber not found" });
      }
  
      return res.status(200).json(updatedBarber);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
}


const getAllBarbersByServiceId = async(req, res) => {
try{
  const {serviceId} = req.query;

  const barbers = await Barber.find({"barberServices.serviceId": serviceId})

  if (!barbers || barbers.length === 0) {
    return res.status(404).json({ message: "No barbers found for the given serviceId" });
}

return res.status(200).json({
  success: true,
  response: barbers});
}
catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Internal Server Error" });
}
  


}


const getBarberServicesByBarberId = async(req, res) => {
  try{
    const {barberId} = req.query;

    const barbers = await Barber.findOne({barberId})
    
    const barberServices = barbers.barberServices;

    if (!barbers) {
      return res.status(404).json({ message: "No barbers found for the geiven BarberId" });
  }

  return res.status(200).json({
    success: true,
    response: barberServices});
}
catch (error) {
  console.error(error);
  return res.status(500).json({ message: "Internal Server Error" });
}

}


//CONNECT BARBER TO SALON API
const connectBarbertoSalon = async(req, res) => {
  try{
    const {email, salonId, barberServices} = req.body;

    const barber = await Barber.findOneAndUpdate({email},
      {salonId:salonId, barberServices: barberServices}, {new: true});
    
      if (!barber) {
        return res.status(404).json({
          success: false,
          message: "Barber not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Barber is added to the salon",
        response: barber,
      });  
  }
  catch (error) {
    // Handle errors that might occur during the operation
    res.status(500).json({
      success: false,
      message: "An error occurred while connecting Barber to the salon",
      error: error.message,
    });
  }
}


//Get BarberDetails by barberEmail
const getBarberDetailsByEmail = async(req, res) =>{
  try{
    const {email} = req.body;

    const barber = await Barber.findOne({email});

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Barber is Found",
      response: barber,
    });  
  }
  catch (error) {
    // Handle errors that might occur during the operation
    res.status(500).json({
      success: false,
      message: "An error occurred while connecting Barber to the salon",
      error: error.message,
    });
  }
}

module.exports = {
  insertDetailsByBarber,
  // barberLogin,
  getAllBarberbySalonId,
  updateBarberAccountDetails,
  deleteBarber,
  chnageBarberWorkingStatus,
  isBarberOnline,
  getAllBarbersByServiceId,
  getBarberServicesByBarberId,
  // addServicesTobarbers,
  loginController, 
  refreshTokenController,
   handleProtectedRoute,
   profileController,
   handleLogout,
   registerController,
   handleForgetPassword,
   handleResetPassword,
   googleLoginController,
   connectBarbertoSalon,
   createBarberByAdmin,
   updateBarberByAdmin,
   getBarberDetailsByEmail,
   uploadBarberprofilePic
}

// https://iqb-frontend.netlify.app/


//create barberby admin
//update barberby admin
//create salonby admin
//update salonby admin
//update admin Accounbt details
//update barber Account details
//upload adminprofile pic
//update adminProfile pic
//delete adminProfile pic 