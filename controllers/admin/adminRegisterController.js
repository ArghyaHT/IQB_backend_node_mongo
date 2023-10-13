
const { validateSignUp } = require("../../middlewares/registerValidator");
const adminService = require("../../services/admin/adminRegisterService")
const Admin = require("../../models/adminRegisterModel")

const adminSignUp = async (req, res) => {
    const adminData = req.body;
    validateSignUp[req]

    try {
        const result = await adminService.createAdmin(adminData);
        res.status(result.status).json({
            response: result.response,
            VerificationCode: result.VerificationCode
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to create admin'
        });
    }
}

const adminSignIn = async(req, res) =>{
    const {email, password} = req.body; 
    try{
        const result = await adminService.signInAdmin(email, password);

        res.status(result.status).json({
            success: true,
            response: result.response,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to Sign In'
        });
    }
}
const adminLogin = async(req, res) =>{
    try {
        const newuser = req.user

        const userExists = await Admin.findOne({ email: newuser.decodeValue.email })

        if (!userExists) {
            //create new user
            try {
                const newUser = new Admin({
                    name: newuser.decodeValue.name || newuser.name,
                    email: newuser.decodeValue.email,              
                    email_verified: newuser.decodeValue.email_verified,
                    auth_time: newuser.decodeValue.auth_time,
                    isAdmin: newuser.admin,            
                })

                const savedUser = await newUser.save()

                res.status(200).json({
                    success: true,
                    message: "Admin created successfully",
                    user: savedUser
                })
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error
                })
            }

        } else {
            try {
                const filter = { email: newuser.decodeValue.email }
                const options = {
                    upsert: true,
                    new: true
                }

                const result = await Admin.findOneAndUpdate(filter, {
                    $set: {
                        auth_time: newuser.decodeValue.auth_time
                    }
                }, options)

                res.status(200).json({
                    success: true,
                    message: "Admin auth time updated successfully",
                    user: result
                })
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: error
                })
            }
        }

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error
        })
    }
}




// router.post("/admin/login", auth, async (req, res) => {
//     try {
//         const newuser = req.user

//         const userExists = await Admin.findOne({ userId: newuser.decodeValue.user_id })

//         if (!userExists) {
//             //create new user
//             try {
//                 const newUser = new Admin({
//                     name: newuser.decodeValue.name,
//                     email: newuser.decodeValue.email,
//                     userId: newuser.decodeValue.user_id,
//                     email_verified: newuser.decodeValue.email_verified,
//                     auth_time: newuser.decodeValue.auth_time,
//                     isAdmin: newuser.admin,
//                     isUser:newuser.user
//                 })

//                 const savedUser = await newUser.save()

//                 res.status(200).json({
//                     success: true,
//                     message: "Admin created successfully",
//                     user: savedUser
//                 })
//             } catch (error) {
//                 return res.status(400).json({
//                     success: false,
//                     message: error
//                 })
//             }

//         } else {
//             try {
//                 const filter = { userId: newuser.decodeValue.user_id }
//                 const options = {
//                     upsert: true,
//                     new: true
//                 }

//                 const result = await Admin.findOneAndUpdate(filter, {
//                     $set: {
//                         auth_time: newuser.decodeValue.auth_time
//                     }
//                 }, options)

//                 res.status(200).json({
//                     success: true,
//                     message: "Admin auth time updated successfully",
//                     user: result
//                 })
//             } catch (error) {
//                 return res.status(404).json({
//                     success: false,
//                     message: error
//                 })
//             }
//         }

//     } catch (error) {
//         return res.status(404).json({
//             success: false,
//             message: error
//         })
//     }
// })

//=================================================

const allAdmins = async(req, res) => {
    try{
        const result = await adminService.getAllAdmins()

        res.status(result.status).json({
            response: result.response,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to Show Admins'
        });
    }
}

const deleteSingleAdmin = async(req, res) =>{
    const {email} = req.body;
    try{
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

const forgetAdminPassword = async(req, res) =>{
    try{
      const {email} = req.body;
      
      const result = await adminService.enterAdminEmail(email);
  
      res.status(result.status).json({
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

  const resetAdminpassword = async (req, res) => {
    try {
      const { email, verificationCode, newPassword } = req.body;
  
      
      const result = await adminService.matchVerificationCodeandResetAdminpassword(email, verificationCode, newPassword);
  
      res.status(200).json({
        message: result.message,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Failed to reset password',
      });
    }
  };

const updateAdmin = async(req, res) =>{
    const adminData = req.body;
    validateSignUp[req]
    try {
        const result = await adminService.updateAdmin(adminData);
        res.status(result.status).json({

            status: result.status,
            response: result.response,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to update admin'
        });
    }
}



module.exports = {
    adminSignUp,
    adminSignIn, 
    allAdmins,
    deleteSingleAdmin, 
    updateAdmin,
    forgetAdminPassword,
    resetAdminpassword,
    adminLogin,

}