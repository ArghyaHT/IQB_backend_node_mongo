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
const { sendPasswordResetEmail } = require("../../utils/emailSender.js");
const UserTokenTable = require("../../models/userTokenModel.js");
const { getAverageBarberRating } = require("../Ratings/barberRatingController.js");
const { validateEmail } = require("../../middlewares/validator.js");
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dfrw3aqyp',
  api_key: '574475359946326',
  api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});


//DESC:REGISTER A Barber 
//====================
const registerController = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const { webFcmToken, androidFcmToken, iosFcmToken } = req.body;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }



    let user = await Barber.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Barber already exists"
      })
    }

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

    // // Save FCM Tokens based on the switch-case logic
    let tokenType, tokenValue;
    if (webFcmToken) {
      tokenType = 'webFcmToken';
      tokenValue = webFcmToken;
    } else if (androidFcmToken) {
      tokenType = 'androidFcmToken';
      tokenValue = androidFcmToken;
    } else if (iosFcmToken) {
      tokenType = 'iosFcmToken';
      tokenValue = iosFcmToken;
    }

    if (tokenType && tokenValue) {
      await UserTokenTable.findOneAndUpdate(
        { email: email },
        { [tokenType]: tokenValue, type: "barber" },
        { upsert: true, new: true }
      );
    }


    // Generate tokens
    const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

    // Set cookies in the response
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 2 days
      secure: true,
      sameSite: "None"
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 1 * 60 * 1000, //1 mins
      secure: true,
      sameSite: "None"
    });

    res.status(200).json({
      success: true,
      message: "Barber registered successfully",
      user
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//DESC:LOGIN A USER =========================
const loginController = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const { webFcmToken, androidFcmToken, iosFcmToken } = req.body;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }


    // Find user by email in the MongoDB database
    const user = await Barber.findOne({ email: email });

    // If user not found or password is incorrect, return unauthorized
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    // // Save FCM Tokens based on the switch-case logic
    let tokenType, tokenValue;
    if (webFcmToken) {
      tokenType = 'webFcmToken';
      tokenValue = webFcmToken;
    } else if (androidFcmToken) {
      tokenType = 'androidFcmToken';
      tokenValue = androidFcmToken;
    } else if (iosFcmToken) {
      tokenType = 'iosFcmToken';
      tokenValue = iosFcmToken;
    }

    if (tokenType && tokenValue) {
      await UserTokenTable.findOneAndUpdate(
        { email: email },
        { [tokenType]: tokenValue, type: "barber" },
        { upsert: true, new: true }
      );
    }

    // Generate tokens
    const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

    // Set cookies in the response
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 2 days
      secure: true,
      sameSite: "None"
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 1 * 60 * 1000, //1 mins
      secure: true,
      sameSite: "None"
    });

    res.status(201).json({
      success: true,
      message: "Barber signed in successfully"
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//GOOGLE SIGNIN ===================================
// const googleLoginController = async (req, res) => {
//   const CLIENT_ID = process.env.CLIENT_ID;
//   const token = req.body.token;
//   const { webFcmToken, androidFcmToken, iosFcmToken } = req.body;

//   if (!token) {
//     res.json({ message: "UnAuthorized User or Invalid User" })
//   }

//   const client = new OAuth2Client(CLIENT_ID);

//   // Call the verifyIdToken to
//   // varify and decode it
//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: CLIENT_ID,
//   });

//   // Get the JSON with all the user info
//   const payload = ticket.getPayload();

//   let user = await Barber.findOne({ email: payload.email, AuthType: "google" });

//   const barberId = await Barber.countDocuments() + 1;

//   //Creating the barberCode
//   const firstTwoLetters = payload.name.slice(0, 2).toUpperCase();
//   const barberCode = firstTwoLetters + barberId;
//   // If the user doesn't exist, create a new user
//   // add barber id by count docuents and isApproved as false 
//   if (!user) {
//     user = new Barber({
//       name: payload.name,
//       email: payload.email,
//       barberId: barberId,
//       barberCode: barberCode,
//       barber: true,
//       AuthType: "google"
//     });
//     await user.save();

//     // Save FCM Tokens based on the switch-case logic
//     let tokenType, tokenValue;
//     switch (true) {
//       case !!webFcmToken:
//         tokenType = 'webFcmToken';
//         tokenValue = webFcmToken;
//         break;
//       case !!androidFcmToken:
//         tokenType = 'androidFcmToken';
//         tokenValue = androidFcmToken;
//         break;
//       case !!iosFcmToken:
//         tokenType = 'iosFcmToken';
//         tokenValue = iosFcmToken;
//         break;
//       default:
//         res.status(201).json({
//           success: false,
//           message: "No valid FCM tokens present"
//         })
//         break;
//     }

//     if (tokenType && tokenValue) {
//       await UserTokenTable.findOneAndUpdate(
//         { email: email },
//         { [tokenType]: tokenValue, type: "barber" },
//         { upsert: true, new: true }
//       );
//     }
//     // Generate tokens
//     const accessToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
//     const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

//     // Set cookies in the response
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,  // 2 days
//       secure: true,
//       sameSite: "None"
//     });
//     res.cookie('accessToken', accessToken, {
//       httpOnly: true,
//       maxAge: 1 * 60 * 1000, //1 mins
//       secure: true,
//       sameSite: "None"
//     });


//     res.status(201).json({
//       success: true,
//       message: "Barber registered in successfully"
//     })
//   }

//   else if (user) {
//     // Save FCM Tokens based on the switch-case logic
//     let tokenType, tokenValue;
//     switch (true) {
//       case !!webFcmToken:
//         tokenType = 'webFcmToken';
//         tokenValue = webFcmToken;
//         break;
//       case !!androidFcmToken:
//         tokenType = 'androidFcmToken';
//         tokenValue = androidFcmToken;
//         break;
//       case !!iosFcmToken:
//         tokenType = 'iosFcmToken';
//         tokenValue = iosFcmToken;
//         break;
//       default:
//         res.status(201).json({
//           success: false,
//           message: "No valid FCM tokens present"
//         })
//         break;
//     }

//     if (tokenType && tokenValue) {
//       await UserTokenTable.findOneAndUpdate(
//         { email: email },
//         { [tokenType]: tokenValue, type: "barber" },
//         { new: true }
//       );
//     }

//     const accessToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
//     const refreshToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });


//     // Set cookies in the response
//     res.cookie('refreshToken',
//       refreshToken, {
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000, // 2 days
//       secure: true,
//       sameSite: "None"
//     });
//     res.cookie('accessToken', accessToken, {
//       httpOnly: true,
//       maxAge: 1 * 60 * 1000, //1 mins
//       secure: true,
//       sameSite: "None"
//     });

//     res.status(201).json({
//       success: true,
//       message: "User signed in successfully"
//     })
//   } else {
//     res.status(401).json({ success: false, message: "Invalid Credentials" })
//   }
// }
const googleLoginController = async (req, res, next) => {
  try {
    const CLIENT_ID = process.env.CLIENT_ID;
    const token = req.body.token;
    const { webFcmToken, androidFcmToken, iosFcmToken } = req.body;

    if (!token) {
      return res.status(400).json({ message: "UnAuthorized User or Invalid User" });
    }

    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await Barber.findOne({ email: payload.email, AuthType: "google" });

    const barberId = await Barber.countDocuments() + 1;
    const firstTwoLetters = payload.name.slice(0, 2).toUpperCase();
    const barberCode = firstTwoLetters + barberId;

    if (!user) {
      user = new Barber({
        name: payload.name,
        email: payload.email,
        barberId: barberId,
        barberCode: barberCode,
        barber: true,
        AuthType: "google"
      });
      await user.save();
      let tokenType, tokenValue;
      if (webFcmToken) {
        tokenType = 'webFcmToken';
        tokenValue = webFcmToken;
      } else if (androidFcmToken) {
        tokenType = 'androidFcmToken';
        tokenValue = androidFcmToken;
      } else if (iosFcmToken) {
        tokenType = 'iosFcmToken';
        tokenValue = iosFcmToken;
      }

      if (tokenType && tokenValue) {
        await UserTokenTable.findOneAndUpdate(
          { email: payload.email },
          { [tokenType]: tokenValue, type: "barber" },
          { upsert: true, new: true }
        );
      }

      const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
      const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, barber: user.barber } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None"
      });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 1 * 60 * 1000,
        secure: true,
        sameSite: "None"
      });

      return res.status(201).json({
        success: true,
        message: "Barber registered successfully"
      });
    } else if (user) {
      let tokenType, tokenValue;
      if (webFcmToken) {
        tokenType = 'webFcmToken';
        tokenValue = webFcmToken;
      } else if (androidFcmToken) {
        tokenType = 'androidFcmToken';
        tokenValue = androidFcmToken;
      } else if (iosFcmToken) {
        tokenType = 'iosFcmToken';
        tokenValue = iosFcmToken;
      }

      if (tokenType && tokenValue) {
        await UserTokenTable.findOneAndUpdate(
          { email: payload.email },
          { [tokenType]: tokenValue, type: "barber" },
          { upsert: true, new: true }
        );
      }

      const accessToken = jwt.sign({ user: { name: user.name, email: user.email, barber: user.barber } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
      const refreshToken = jwt.sign({ user: { name: user.name, email: user.email, barber: user.barber } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None"
      });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 1 * 60 * 1000,
        secure: true,
        sameSite: "None"
      });

      return res.status(201).json({
        success: true,
        message: "Barber signed in successfully"
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//DESC:REFRESH TOKEN ==============================
const refreshTokenController = async (req, res, next) => {
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
      sameSite: "None"
    });

    res.status(201).json({ success: true, message: "New accessToken generated" });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//DESC:LOGOUT A USER ========================
const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: "None" })
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: "None" })

    res.status(200).json({
      success: true,
      message: "Barber logged out successfully"
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//DESC:FORGOT PASSWORD SENDING EMAIL TO USER ===========
const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

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
              <p>Please click here to link <a style="background-color: #c2e7ff; padding: 8px 12px; border-radius: 15px; color: white; text-decoration: none; border: none; margin-left:10px;color:black;font-weigth:bold" href="${CLIENT_URL}/barber-resetpassword/${resetToken}" target="_blank">Reset your password</a></p>
          `
    };

    try {
      await emailWithNodeMail(emailData)
    } catch (error) {
      console.log(error);
      next(error);
    }

    res.status(200).json({
      success: true,
      message: `Please go to your ${email} for reseting the password`,
      payload: {
        resetToken
      }
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
}


//DESC:RESET PASSWORD =================================
const handleResetPassword = async (req, res, next) => {
  try {

    const { password } = req.body;

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.log(error);
    next(error);
  }
}


//MIDDLEWARE FOR ALL PROTECTED ROUTES ==================

const isBarberLogginMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh Token not present. Please Login Again",
      });
    }

    // Verify old refresh token
    const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

    console.log(decodeToken)

    const loggedinUser = await Barber.findOne({ email: decodeToken.user.email, barber: decodeToken.user.barber });
    if (!decodeToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token. Unauthorized User",
      });
    }
    if (loggedinUser === null) {
      return res.status(400).json({
        success: false,
        message: "You are not a Barber",
        user: [loggedinUser]
      });
    }
    return res.status(200).json({
      success: true,
      message: "User already logged in",
      user: [loggedinUser]
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
}

const isBarberLoggedOutMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;


    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh Token not present.Please Login Again",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}
// const handleProtectedRoute = async (req, res, next) => {
//   try {
//       const accessToken = req.cookies.accessToken;
//       const refreshToken = req.cookies.refreshToken;

//       if(!refreshToken){
//           return res.status(403).json({
//               success: false,
//               message: "Refresh Token not present.Please Login Again",
//           });
//       }

//       // Verify old refresh token
//       const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

//       if (!decodeToken) {
//           return res.status(401).json({
//               success: false,
//               message: "Invalid Access Token. UnAuthorize User",
//           });
//       }

//       req.user = decodeToken.user;
//       next();
//   } catch (error) {
//       //This Error is for access Token getting expired or JWT must be provided
//       if(error.message == "jwt must be provided"){
//           res.status(500).json({
//               success: false,
//               message: error,
//           });
//       }else{
//           return res.json({
//               success: false,
//               message: error,
//           });
//       }  
//   }

// };

//MIDDLEWARE FOR ALL PROTECTED ROUTES ==================
const handleBarberProtectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh Token not present.Please Login Again",
      });
    }

    // Verify old refresh token
    const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

    console.log(decodeToken)

    if (!decodeToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token. UnAuthorize User",
      });
    }

    req.user = decodeToken.user;

    // console.log(req.user.barber)

    if (req.user && !req.user.admin) {
      next();
    } else {
      return res.status(404).json({
        success: false,
        message: "You are not Authenticated Barber"
      })
    }

  } catch (error) {
    console.log(error);
    next(error);
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

const insertDetailsByBarber = async (req, res, next) => {
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
    console.log(error);
    next(error);
  }
}


//DESC Create Barber By Admin
const createBarberByAdmin = async (req, res, next) => {
  try {
    const {
      email,
      name,
      nickName,
      mobileNumber,
      salonId,
      dateOfBirth,
      barberServices // Array of service objects containing serviceId, serviceCode, servicePrice, serviceName, serviceEWT
    } = req.body;

    // Check if required fields are missing
    if (!email || !name || !mobileNumber || !salonId || !dateOfBirth || !barberServices || !Array.isArray(barberServices)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits"
      });
    }
    // Validate barberServices format
    for (const service of barberServices) {
      const { serviceId, serviceCode, servicePrice, serviceName, serviceEWT } = service;

      if (!serviceId || !serviceCode || !servicePrice || !serviceName || !serviceEWT) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields in barber service object"
        });
      }
    }

    // Check if the barber with the provided email already exists
    const barber = await Barber.findOne({ email });

    if (barber) {
      return res.status(400).json({
        success: false,
        message: "Barber with the EmailId already exists. Please enter another Email"
      });
    }

    //Creating the random Password of ^ digit
    const randomPassword = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const randomString = randomPassword.toString();

    // Hashing the password
    const hashedPassword = await bcrypt.hash(randomString, 10);

    // Creating the barberId and barberCode
    const barberId = await Barber.countDocuments() + 1;
    const firstTwoLetters = name.slice(0, 2).toUpperCase();
    const barberCode = firstTwoLetters + barberId;

    // Create a new barber document
    const newBarber = new Barber({
      email,
      password: hashedPassword,
      name,
      nickName,
      salonId,
      mobileNumber,
      dateOfBirth,
      barber: true,
      isApproved: true,
      barberCode,
      barberId,
      barberServices // Assigning the received services array
    });

    // Save the new barber to the database
    const savedBarber = await newBarber.save();

    const emailData = {
      email,
      subject: 'Your Login Details',
      html: `
      <h2>Hello ${name}!</h2>
      <p>Your auto generated password is ${randomPassword}. Please login by this password and reset your password</p>
    `
    };

    try {
      await sendPasswordResetEmail(emailData);
    } catch (error) {
      console.log(error);
      next(error);
    }

    res.status(201).json({
      success: true,
      message: "Barber Successfully Created",
      response: savedBarber
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//DESC Update BarberBy Admin
const updateBarberByAdmin = async (req, res, next) => {
  try {
    const { email, name, nickName, salonId, mobileNumber, dateOfBirth, barberServices } = req.body;
    // Check if required fields are missing or empty
    if (!email || !name || !nickName || !salonId || !mobileNumber || !dateOfBirth || !barberServices) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits"
      });
    }

    if (!barberServices || barberServices.length === 0) {
      return res.status(400).json({
          success: false,
          message: "Barber services array cannot be empty"
      });
  }

    if (barberServices.length > 0) {
      // Validate barberServices format
      for (const service of barberServices) {
        const { serviceId, serviceCode, servicePrice, serviceName, serviceEWT } = service;

        if (!serviceId || !serviceCode || !servicePrice || !serviceName || !serviceEWT) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields in barber service object"
          });
        }
      }
    }

    //If barberServices is present for updating
    if (barberServices && barberServices.length > 0) {
      //Update the services accordingly
      for (const service of barberServices) {
        const { serviceId, serviceName, serviceCode, barberServiceEWT } = service;

        const updateService = await Barber.findOneAndUpdate(
          { email, salonId, 'barberServices.serviceId': serviceId },
          {
            $set: {
              'barberServices.$.serviceName': serviceName,
              'barberServices.$.serviceCode': serviceCode,
              'barberServices.$.barberServiceEWT': barberServiceEWT, // Update other fields if needed
            }
          },
          { new: true }
        );

        // If BarberServices Not Present
        if (!updateService) {
          const newService = {
            serviceId,
            serviceName,
            serviceCode,
            barberServiceEWT
          };
          await Barber.findOneAndUpdate(
            { email, salonId },
            { $addToSet: { barberServices: newService } },
            { new: true }
          );
        }

      }
    }


    const updatedBarber = await Barber.findOneAndUpdate({ email }, { name, nickName, mobileNumber, dateOfBirth }, { new: true });

    if (!updatedBarber) {
      res.status(404).json({
        success: false,
        message: 'Barber With the email not found',
      });
    }

    res.status(200).json({
      success: true,
      message: "Barber has been successfully updated",
      response: updatedBarber
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }

}

//Upload Barber profile Picture
const uploadBarberprofilePic = async (req, res, next) => {
  try {
    let profiles = req.files.profile;
    const email = req.body.email;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    if (!profiles) {
      return res.status(400).json({ success: false, message: "Please provide profile image" });
    }

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
            .catch((error) => {
              console.log(error);
              next(error);
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

        const barberImage = await Barber.findOneAndUpdate({ email }, { profile: profileimg }, { new: true });

        res.status(200).json({
          success: true,
          message: "Files Uploaded successfully",
          barberImage
        });
      })
      .catch((error) => {
        console.log(error);
        next(error);
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Update Barber Profile Picture
const updateBarberProfilePic = async (req, res, next) => {
  try {
    const id = req.body.id;

    const barberProfile = await Barber.findOne({ "profile._id": id }, { "profile.$": 1 })

    const public_imgid = req.body.public_imgid;
    const profile = req.files.profile;

    if (!profile) {
      return res.status(400).json({ success: false, message: "Please provide profile image" });
    }

    // Validate Image
    const fileSize = profile.size / 1000;
    const fileExt = profile.name.split(".")[1];

    if (fileSize > 500) {
      return res.status(400).json({ success: false, message: "File size must be lower than 500kb" });
    }

    if (!["jpg", "png", "jfif", "svg"].includes(fileExt)) {
      return res.status(400).json({ success: false, message: "File extension must be jpg or png" });
    }

    // Generate a unique public_id based on the original file name
    const public_id = `${profile.name.split(".")[0]}`;

    cloudinary.uploader.upload(profile.tempFilePath, {
      public_id: public_id,
      folder: "students",
    })
      .then(async (image) => {

        const result = await cloudinary.uploader.destroy(public_imgid);

        if (result.result === 'ok') {
          console.log("cloud img deleted")

        } else {
          res.status(500).json({
            message: 'Failed to delete image.'
          });
        }

        // Delete the temporary file after uploading to Cloudinary
        fs.unlink(profile.tempFilePath, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const updatedBarber = await Barber.findOneAndUpdate(
          { "profile._id": id },
          {
            $set: {
              'profile.$.public_id': image.public_id,
              'profile.$.url': image.url
            }
          },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: "Files Updated successfully",
          updatedBarber
        });

      })

  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Delete Barber Profile Picture
const deleteBarberProfilePicture = async (req, res, next) => {
  try {
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ success: false, message: 'Failed to delete image.' });
    }

    const updatedBarber = await Barber.findOneAndUpdate(
      { 'profile._id': img_id },
      { $pull: { profile: { _id: img_id } } },
      { new: true }
    );

    if (updatedBarber) {
      res.status(200).json({
        success: true,
        message: "Image successfully deleted"
      })
    } else {
      res.status(404).json({ success: false, message: 'Image not found in the student profile' });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Get all barber By SalonId
const getAllBarberbySalonId = async (req, res, next) => {
  try {
    const { salonId, name, email, page = 1, limit = 10, sortField, sortOrder } = req.query;
    let query = {}; // Filter for isDeleted set to false



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

    const getAllBarbers = await Barber.find({ salonId, isDeleted: false }).sort(sortOptions).skip(skip).limit(Number(limit));

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
    console.log(error);
    next(error);
  }
};

//Update Barber Account Details
const updateBarberAccountDetails = async (req, res, next) => {
  const { name, email, nickName, mobileNumber, dateOfBirth, gender, password } = req.body;
  try {
    // Check if required fields are missing or empty
    if (!name || !email || !mobileNumber || !dateOfBirth) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    // Validate mobile number format (assuming it should be exactly 10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Invalid mobile number format" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }
    const barberData = {
      name, email, nickName, mobileNumber, dateOfBirth, gender, password
    }
    const result = await barberService.updateBarberByEmail(barberData)

    res.status(result.status).json({
      success: true,
      response: result.response,
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

const deleteBarber = async (req, res, next) => {
  const { salonId } = req.query;
  const { email } = req.body
  try {
    // Validate salonId from query parameters
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: "Salon ID is required"
      });
    }
    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    const result = await barberService.deleteBarberByEmail(salonId, email);

    res.status(result.status).json({
      success: true,
      response: result.response,
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

//Change Barber Working Status
const chnageBarberWorkingStatus = async (req, res, next) => {
  try {
    const { barberId } = req.params;
    const { isActive } = req.body;

    // Update the isActive status in the database
    const updatedBarber = await Barber.findOneAndUpdate(barberId, { isActive }, { new: true });

    if (!updatedBarber) {
      return res.status(404).json({ success: false, message: "Barber not found" });
    }

    return res.status(200).json(updatedBarber);
  } catch (error) {
    console.log(error);
    next(error);
  }

}

//To Check If The Barber Is Online 
const isBarberOnline = async (req, res, next) => {
  try {
    const { barberId, salonId, isOnline } = req.body;

    // Validate salonId from query parameters
    if (!salonId || !barberId) {
      return res.status(400).json({
        success: false,
        message: "missing salonId and barberId"
      });
    }

    const updatedBarber = await Barber.findOneAndUpdate(
      { barberId: barberId, salonId: salonId },
      { isOnline: isOnline }, // Update the isOnline field in the database
      { new: true }
    );

    if (!updatedBarber) {
      return res.status(404).json({ success: false, message: "Barber not found" });
    }

    return res.status(200).json(updatedBarber);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Get All Barbers By Service Id
const getAllBarbersByServiceId = async (req, res, next) => {
  try {
    const { serviceId } = req.query;

    // Validate salonId from query parameters
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "ServiceId is required"
      });
    }

    const barbers = await Barber.find({ "barberServices.serviceId": serviceId, isDeleted: false })

    if (!barbers || barbers.length === 0) {
      return res.status(404).json({ success: false, message: "No barbers found for the given serviceId" });
    }

    return res.status(200).json({
      success: true,
      response: barbers
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


const getBarberServicesByBarberId = async (req, res, next) => {
  try {
    const { barberId } = req.query;

    // Validate salonId from query parameters
    if (!barberId) {
      return res.status(400).json({
        success: false,
        message: "BarberId is required"
      });
    }

    const barbers = await Barber.findOne({ barberId })

    const barberServices = barbers.barberServices;

    if (!barbers) {
      return res.status(404).json({ success: false, message: "No barbers found for the geiven BarberId" });
    }

    return res.status(200).json({
      success: true,
      response: barberServices
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }

}


//CONNECT BARBER TO SALON API
const connectBarbertoSalon = async (req, res, next) => {
  try {
    const { email, salonId, barberServices } = req.body;
    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate salonId presence and format
    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: "Salon ID is required"
      });
    }
    // Assuming salonId is numeric, you can add additional validation here if necessary

    // Validate barberServices if present
    if (barberServices !== undefined) {
      if (barberServices.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Barber services must be provided as an array"
        });
      }
      // You can add additional validation for each object in the barberServices array if necessary
    }

    const barber = await Barber.findOneAndUpdate({ email },
      { salonId: salonId, barberServices: barberServices }, { new: true });

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
    console.log(error);
    next(error);
  }
}


//Get BarberDetails by barberEmail
const getBarberDetailsByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const barber = await Barber.findOne({ email }).populate("barberRatings");

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    const getBarberRating = await getAverageBarberRating(barber.salonId, barber.barberId)

    console.log(barber.salonId, barber.barberId)

    res.status(200).json({
      success: true,
      message: "Barber retrieved successfully",
      response: {
        ...barber.toObject(), // Convert Mongoose document to plain JavaScript object
        barberRating: getBarberRating,
      },
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

//Send Email Verification code
const sendVerificationCodeForBarberEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await Barber.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        response: "User with this email does not exist. Please register first",
      });
    }

    const verificationCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const emailData = {
      email,
      subject: 'Verify your Email',
      html: `
          <h2>Hello ${user.name}!</h2>
          <p>Your To verify your Email please note the verification code. Your verification code is ${verificationCode}</p>
        `
    };

    user.verificationCode = verificationCode;
    await user.save();

    try {
      await sendPasswordResetEmail(emailData);
    } catch (error) {
      console.log(error);
      next(error);
    }

    return res.status(200).json({
      success: true,
      message: `Please check your email (${email}) for verification.`,
      verificationCode: verificationCode
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Match Verification Code and change EmailVerified Status
const changeBarberEmailVerifiedStatus = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;



    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }


    // FIND THE CUSTOMER 
    const barber = await Barber.findOne({ email });

    if (barber && barber.verificationCode === verificationCode) {
      // If verification code matches, clear it from the database
      barber.verificationCode = '';
      barber.emailVerified = true;
      await barber.save();

      return res.status(200).json({
        success: true,
        response: barber,
      });
    }

    // If verification code doesn't match or customer not found
    return res.status(201).json({
      success: false,
      response: "Verification Code didn't match",
      message: "Enter a valid Verification code",
    });
  } catch (error) {
    console.log(error);
    next(error);
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
  //  handleProtectedRoute,
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
  uploadBarberprofilePic,
  updateBarberProfilePic,
  deleteBarberProfilePicture,
  isBarberLogginMiddleware,
  isBarberLoggedOutMiddleware,
  sendVerificationCodeForBarberEmail,
  changeBarberEmailVerifiedStatus,
  handleBarberProtectedRoute

}


