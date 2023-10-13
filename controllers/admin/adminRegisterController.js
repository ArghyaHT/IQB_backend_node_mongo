
const { validateSignUp } = require("../../middlewares/registerValidator");
const adminService = require("../../services/admin/adminRegisterService")

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
    resetAdminpassword

}