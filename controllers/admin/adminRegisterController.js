
const { validateSignUp } = require("../../middlewares/registerValidator");
const adminService = require("../../services/admin/adminRegisterService")
const Admin = require("../../models/adminRegisterModel")
const Barber = require("../../models/barberRegisterModel")

const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const emailWithNodeMail = require('../../utils/nodeMailer.js');
const crypto = require("crypto");
const bcrypt = require("bcrypt")

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


//DESC:REGISTER A USER 
//====================
const registerController = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        let user = await Admin.findOne({ email: email });

        // If the user doesn't exist, create a new user
        if (!user) {
            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10);

            user = new Admin({
                email: email,
                password: hashedPassword,
                admin: true
            });
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "Admin registered successfully",
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
        const user = await Admin.findOne({ email: email });

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
            expires: new Date(Date.now() + 10 * 60 * 1000), //10 min
            secure: true,
            sameSite: "None"
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 20 * 1000), //20 seconds
            secure: true,
            sameSite: "None"
        });


        res.status(201).json({
            success: true,
            message: "Admin signed in successfully"
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

    let user = await Admin.findOne({ email: payload.email, AuthType: "google" });

    // If the user doesn't exist, create a new user
    // add barber id by count docuents and isApproved as false 
    if (!user) {
        user = new Admin({
            name: payload.name,
            email: payload.email,
            admin: true,
            AuthType: "google"
        });
        await user.save();
    }

    else if (user) {
        const accessToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_ACCESS_SECRET, { expiresIn: "20s" });
        const refreshToken = jwt.sign({ user: { name: user.name, email: user.email } }, JWT_REFRESH_SECRET, { expiresIn: "10m" });


        // Set cookies in the response
        res.cookie('refreshToken',
            refreshToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            secure: true,
            sameSite: "None"
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 20 * 1000), // 20 seconds 
            secure: true,
            sameSite: "None"
        });


        res.status(201).json({
            success: true,
            message: "Admin signed in successfully"
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
            expires: new Date(Date.now() + 20 * 1000),
            secure: true,
            sameSite: "None"
        });

        res.status(201).json({ success: true, message: "New accessToken generated" });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid refresh token." });
    }
}

//DESC:LOGOUT A USER ========================
const handleLogout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

//DESC:FORGOT PASSWORD SENDING EMAIL TO USER ===========
const handleForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        const user = await Admin.findOne({ email: email })

        if (!user) {
            throw createError(404, "Admin with this email does not exist.Please register first")
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

        const user = await Admin.findOne({
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

        if (!refreshToken) {
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
        if (error.message == "jwt must be provided") {
            res.status(500).json({
                success: false,
                message: error,
            });
        } else {
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

const deleteSingleAdmin = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await adminService.deleteAdmin(email)
        res.status(result.status).json({
            response: result.response,
        });
    }

    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to Delete Admins'
        });
    }
}

const updateAdminAccountDetails = async (req, res) => {
    const adminData = req.body;
    try {
        const result = await adminService.updateAdmin(adminData);
        res.status(result.status).json({
            success: true,
            response: result.response,
            error: result.error
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to update admin'

        });
    }
}

const approveBarber = async (req, res) => {
    try {
        const { salonId, email, isApproved } = req.body;

        const approvedStatus = await Barber.findOneAndUpdate({ salonId, email }, { isApproved }, { new: true });

        if (!email) {
            res.status(201).json({
                success: false,
                message: "Barber with the EmailId not found for the Salon",
            });
        }
        res.status(200).json({
            success: true,
            message: "Barber has been approved",
            response: approvedStatus
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

//Upload Barber profile Picture
const uploadAdminprofilePic = async(req, res) => {
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
  
          const adminImage = await Admin.findOneAndUpdate({email},{ profile: profileimg}, {new: true});
  
          res.status(200).json({
            success: true,
            message: "Files Uploaded successfully",
           adminImage
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
             message: "Cloudinary upload failed" ,
             err: err.message});
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Internal Server Error",
        error: error.message
     });
    }
  }
  
  //Update Barber Profile Picture
  const updateAdminProfilePic = async(req, res) =>{
    try {
      const id = req.body.id;
  
      const adminProfile = await Admin.findOne({ "profile._id": id }, { "profile.$": 1 })
  
      const public_imgid = req.body.public_imgid; 
      const profile = req.files.profile;
  
      // Validate Image
      const fileSize = profile.size / 1000;
      const fileExt = profile.name.split(".")[1];
  
      if (fileSize > 500) {
        return res.status(400).json({ message: "File size must be lower than 500kb" });
      }
  
      if (!["jpg", "png", "jfif", "svg"].includes(fileExt)) {
        return res.status(400).json({ message: "File extension must be jpg or png" });
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
              message: 'Failed to delete image.' });
          }
  
          // Delete the temporary file after uploading to Cloudinary
          fs.unlink(profile.tempFilePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
  
          const updatedAdmin = await Admin.findOneAndUpdate(
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
            updatedAdmin
          });
          
        })
  
  
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Internal Server Error",
        error: error.message
     });
    }
  }
  
  //Delete Barber Profile Picture
  const deleteAdminProfilePicture = async(req, res) => {
    try {
      const public_id = req.body.public_id
      const img_id = req.body.img_id
  
      const result = await cloudinary.uploader.destroy(public_id);
  
      if (result.result === 'ok') {
        console.log("cloud img deleted")
  
      } else {
        res.status(500).json({ message: 'Failed to delete image.' });
      }
  
      const updatedAdmin = await Admin.findOneAndUpdate(
        { 'profile._id': img_id },
        { $pull: { profile: { _id: img_id } } },
        { new: true }
      );
  
      if (updatedAdmin) {
        res.status(200).json({
          success: true,
          message: "Image successfully deleted"
        })
      } else {
        res.status(404).json({ message: 'Image not found in the student profile' });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
         message: 'Internal server error.', 
        error: error.message});
    }
  }

module.exports = {
    deleteSingleAdmin,
    updateAdminAccountDetails,
    loginController,
    refreshTokenController,
    handleProtectedRoute,
    profileController,
    handleLogout,
    registerController,
    handleForgetPassword,
    handleResetPassword,
    googleLoginController,
    approveBarber,
    uploadAdminprofilePic,
    updateAdminProfilePic,
    deleteAdminProfilePicture,
}