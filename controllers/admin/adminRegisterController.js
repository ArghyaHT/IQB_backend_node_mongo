
const { validateSignUp } = require("../../middlewares/registerValidator");
const adminService = require("../../services/admin/adminRegisterService")
const Admin = require("../../models/adminRegisterModel")
const Barber = require("../../models/barberRegisterModel")
const Salon = require("../../models/salonsRegisterModel")

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
const { sendPasswordResetEmail } = require("../../utils/emailSender");
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name: 'dfrw3aqyp',
    api_key: '574475359946326',
    api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});


//DESC:REGISTER A ADMIN 
//====================
const registerController = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password

        let user = await Admin.findOne({ email: email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists"
            })
        }

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

            // Generate tokens
            const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, admin:user.admin } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
            const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, admin:user.admin } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

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
                message: "Admin registered successfully",
                user
            })
        }


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

        // Find user by email in the MongoDB database
        const user = await Admin.findOne({ email: email });

        // If user not found or password is incorrect, return unauthorized
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        // Generate tokens
        const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, admin:user.admin } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
        const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, admin:user.admin } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

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
            message: "Admin signed in successfully",
        });
    } catch (error) {
        console.log(error);
        next(error);
      }
};


//GOOGLE SIGNIN ===================================
const googleLoginController = async (req, res, next) => {
 try{
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
        await user.save()

        // Generate tokens
        const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, admin: user.admin } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
        const refreshToken = jwt.sign({ user: { _id: user._id, email: user.email, admin: user.admin } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });

        // Set cookies in the response
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,  // 2 days
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
            message: "Admin registered successfully"
        })
    }

    else if (user) {
        const accessToken = jwt.sign({ user: { name: user.name, email: user.email, admin: user.admin } }, JWT_ACCESS_SECRET, { expiresIn: "1m" });
        const refreshToken = jwt.sign({ user: { name: user.name, email: user.email, admin: user.admin } }, JWT_REFRESH_SECRET, { expiresIn: "2d" });


        // Set cookies in the response
        res.cookie('refreshToken',
            refreshToken, {
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
            message: "Admin signed in successfully"
        })
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" })
    }

    }catch (error) {
    console.log(error);
    next(error);
  }
    
}

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
            expires: new Date(Date.now() + 20 * 1000),
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
            message: "User logged out successfully"
        })
    }catch (error) {
        console.log(error);
        next(error);
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
        console.log(error);
        next(error);
      }
}


//MIDDLEWARE FOR ALL PROTECTED ROUTES ==================

// const isLogginMiddleware = async (req, res) => {
//     try {
//         const accessToken = req.cookies.accessToken;
//         const refreshToken = req.cookies.refreshToken;

//         if (!refreshToken) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Refresh Token not present. Please Login Again",
//             });
//         }

//         // Verify old refresh token
//         const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

//         const loggedinUser = await Admin.findOne({ email: decodeToken.user.email});

//          //Fetch the salon details using the salonId of the logged-in admin
//         const loggedInSalon = await Salon.findOne({ salonId: loggedinUser.salonId });

//         if (!decodeToken) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Access Token. Unauthorized User",
//             });
//         }
//         return res.status(200).json({
//             success: true,
//             message: "User already logged in",
//             user: [loggedinUser]
//         });
//         // if (loggedinUser) {
//         //     return res.status(200).json({
//         //         success: true,
//         //         message: "User already logged in",
//         //         user: [loggedinUser]
//         //     });
//         // } else {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "You are not an admin",
//         //         user: [loggedinUser]
//         //     });
//         // }

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// }

const isLogginMiddleware = async (req, res, next) => {
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

        const loggedinUser = await Admin.findOne({ email: decodeToken.user.email, admin: decodeToken.user.admin });

        if (!decodeToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid Access Token. Unauthorized User",
            });
        }
        if (loggedinUser === null) {
             return res.status(400).json({
                success: false,
                message: "You are not an Admin.",
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

// const isLogginMiddleware = async (req, res) => {
//     try {
//         const accessToken = req.cookies.accessToken;
//         const refreshToken = req.cookies.refreshToken;

//         if (!refreshToken) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Refresh Token not present.Please Login Again",
//             });
//         }

//         // Verify old refresh token
//         const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

//         const loggedinUser = await Admin.findOne({ email: decodeToken.user.email })

//         // Fetch the salon details using the salonId of the logged-in admin
//         const loggedInSalon = await Salon.findOne({ salonId: loggedinUser.salonId });

//         if (!decodeToken) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Access Token. UnAuthorize User",
//             });
//         }

//         res.setHeader('Cache-Control', 'no-cache');

//         const generateETag = (data) => {
//             const hash = crypto.createHash('sha256');
//             hash.update(JSON.stringify(data));
//             return hash.digest('hex')
//         }

//         const etag = generateETag(loggedinUser)

//         console.log("Sagnik",etag)

//         const clientEtag = req.get('If-None-Match');

//         if(clientEtag === etag){
//             return res.status(304).end();
//         }


//         res.setHeader('ETag', etag);

//         return res.status(200).json({
//             success: true,
//             message: "User already logged in",
//             user: [loggedinUser]
//         });

//     } catch (error) {
//         return res.json({
//             success: false,
//             message: "Problem",
//             error: error.message
//         });
//     }
// }

// const isLogginMiddleware = async (req, res) => {
//     try {
//         const accessToken = req.cookies.accessToken;
//         const refreshToken = req.cookies.refreshToken;

//         if (!refreshToken) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Refresh Token not present. Please Login Again",
//             });
//         }

//         // Verify old refresh token
//         const decodeToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);

//         const loggedinUser = await Admin.findOne({ email: decodeToken.user.email });

//         // Fetch the salon details using the salonId of the logged-in admin
//         const loggedInSalon = await Salon.findOne({ salonId: loggedinUser.salonId });

//         if (!decodeToken) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid Access Token. Unauthorized User",
//             });
//         }

//         res.setHeader('Cache-Control', 'no-cache');

//         const generateETag = (data) => {
//             const hash = crypto.createHash('sha256');
//             hash.update(JSON.stringify(data));
//             return hash.digest('hex');
//         };

//         const etag = generateETag(loggedinUser);

//         console.log("Sagnik", etag);

//         const clientEtag = req.get('If-None-Match');

//         if (clientEtag === etag) {
//             return res.status(304).end();
//         }

//         res.setHeader('ETag', etag);

//         return res.status(200).json({
//             success: true,
//             message: "User already logged in",
//             user: [loggedinUser],
//         });

//     } catch (error) {
//         return res.json({
//             success: false,
//             message: "Problem",
//             error: error.message,
//         });
//     }
// };


const isLoggedOutMiddleware = async (req, res, next) => {
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

        console.log(decodeToken)

        if (!decodeToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid Access Token. UnAuthorize User",
            });
        }

        req.user = decodeToken.user;

        // console.log(req.user.barber)

        if(req.user && !req.user.barber){
            next();
        }else{
            return res.status(404).json({
                success: false,
                message:"You are not Authenticated Admin"})
        }
        
    } catch (error) {
        console.log(error);
        next(error);
      }

};

//PROETCTED ROUTE =============================
// const profileController = async (req, res) => {
//     const user = req.user;

//     res.status(200).json({
//         success: true,
//         message: "Protected Resources accessed successfully.",
//         user,
//     });
// };

const deleteSingleAdmin = async (req, res, next) => {
    const { email } = req.body;
    try {
        const result = await adminService.deleteAdmin(email)
        res.status(result.status).json({
            response: result.response,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
      }
}


//TO UPDATE ADMIN ACCOUNT DETAILS
const updateAdminAccountDetails = async (req, res, next) => {
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
        console.log(error);
        next(error);
      }
}


//APPROVE BARBER API
const approveBarber = async (req, res, next) => {
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
        console.log(error);
        next(error);
      }
}

//Upload Admin profile Picture
const uploadAdminprofilePic = async (req, res, next) => {
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

                const adminImage = await Admin.findOneAndUpdate({ email }, { profile: profileimg }, { new: true });

                res.status(200).json({
                    success: true,
                    message: "Files Uploaded successfully",
                    adminImage
                });
            })
            .catch((error) => {
                console.log(error);
        next(error);
            });
    }catch (error) {
        console.log(error);
        next(error);
      }
}

//Update Admin Profile Picture
const updateAdminProfilePic = async (req, res, next) => {
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
                        message: 'Failed to delete image.'
                    });
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



    }  catch (error) {
        console.log(error);
        next(error);
      }
}

//Delete Admin Profile Picture
const deleteAdminProfilePicture = async (req, res, next) => {
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
    }  catch (error) {
        console.log(error);
        next(error);
      }
}

//Get Salons by Admin
const getAllSalonsByAdmin = async (req, res, next) => {
    try {
        const { adminEmail } = req.body; // Assuming admin's email is provided in the request body

        // Find the admin based on the email
        const admin = await Admin.findOne({ email: adminEmail });

        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found',
            });
        }

        // Fetch all salons associated with the admin from registeredSalons array
        const salons = await Salon.find({
            salonId: { $in: admin.registeredSalons },
            isDeleted: false,
        });

        res.status(200).json({
            message: 'Salons retrieved successfully',
            salons: salons,
        });
    } catch (error) {
        console.log(error);
        next(error);
      }
}

//Get Default Salon Details Of Admin
const getDefaultSalonByAdmin = async (req, res, next) => {
    try {
        const { adminEmail } = req.body;
        const admin = await Admin.findOne({ email: adminEmail })
        if (!admin) {
            res.status(404).json({
                message: 'No admin found.',
            });
        }
        else {
            const defaultSalon = await Salon.findOne({ salonId: admin.salonId })

            // res.setHeader('Cache-Control', 'private, max-age=3600');
            res.status(200).json({
                message: "Salon Found",
                response: defaultSalon
            })
        }
    }
    catch (error) {
        console.log(error);
        next(error);
      }
}


//Change Salon Id of Admin
const changeDefaultSalonIdOfAdmin = async (req, res, next) => {
    try {
        const { adminEmail, salonId } = req.body; // Assuming admin's email and new salonId are provided in the request body

        // Find the admin based on the provided email
        const admin = await Admin.findOne({ email: adminEmail });

        console.log(admin)
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found',
            });
        }

        // Update the default salonId of the admin
        admin.salonId = salonId;
        await admin.save();

        res.status(200).json({
            message: 'Default salon ID of admin updated successfully',
            admin: admin,
        });
    }  catch (error) {
        console.log(error);
        next(error);
      }
};

//Send Email Verification code
const sendVerificationCodeForAdminEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await Admin.findOne({ email });
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
        }  catch (error) {
            console.log(error);
            next(error);
          }

        return res.status(200).json({
            success: true,
            message: `Please check your email (${email}) for verification.`,
            verificationCode: verificationCode
        });
    }  catch (error) {
        console.log(error);
        next(error);
      }
}

//Match Verification Code and change EmailVerified Status
const changeEmailVerifiedStatus = async (req, res, next) => {
    try {
        const { email, verificationCode } = req.body;

        // FIND THE CUSTOMER 
        const admin = await Admin.findOne({ email });

        if (admin && admin.verificationCode === verificationCode) {
            // If verification code matches, clear it from the database
            admin.verificationCode = '';
            admin.emailVerified = true;
            await admin.save();

            return res.status(200).json({
                success: true,
                response: admin,
            });
        }

        // If verification code doesn't match or customer not found
        return res.status(201).json({
            success: false,
            response: "Verification Code didn't match",
            message: "Enter a valid Verification code",
        });
    }  catch (error) {
        console.log(error);
        next(error);
      }
}


module.exports = {
    deleteSingleAdmin,
    updateAdminAccountDetails,
    loginController,
    refreshTokenController,
    handleProtectedRoute,
    // profileController,
    handleLogout,
    isLogginMiddleware,
    isLoggedOutMiddleware,
    registerController,
    handleForgetPassword,
    handleResetPassword,
    googleLoginController,
    approveBarber,
    uploadAdminprofilePic,
    updateAdminProfilePic,
    deleteAdminProfilePicture,
    getAllSalonsByAdmin,
    changeDefaultSalonIdOfAdmin,
    sendVerificationCodeForAdminEmail,
    changeEmailVerifiedStatus,
    getDefaultSalonByAdmin
}