const Customer = require("../models/customerRegisterModel.js")

const bcrypt =  require("bcrypt")

const crypto = require("crypto")

//----------SignUp For customer-----------------//
const createCustomer = async(customerData) =>{
    try{
        const {
            Email,
            FirstName,
            LastName,
            Gender,
            DateOfBirth,
            MobileNumber,
            Password,
            ReEnterPassword,
            CustomerType
          } = customerData;

              //Find the Customer If exits 
      const existingCustomer = await Customer.findOne({Email});

      if(existingCustomer){
        return{
            status: 400,
            response: 'A customer with the provided email already exists',
          };
      }



       //Check if the password length is less than 8 characters
       if(Password.length < 8){
        return{
            status:400,
            response: 'Password must be at least 8 characters long',
          };
      }

      if(Password !== ReEnterPassword){
        return { 
            status: 400,
            response: "Passwords do not match" };
      }
      const verificationCode = crypto.randomBytes(2).toString('hex');
      const hashedPassword = await bcrypt.hash(Password, 10);

            //Save the customer
            const customer = new Customer({   Email, 
                FirstName,
                LastName,
                Gender,
                DateOfBirth,
                MobileNumber,
                Password: hashedPassword,
                VerificationCode: verificationCode,
                CustomerType});


              const savedCustomer = await customer.save();
              return{
                status: 200,
                response: savedCustomer,
                VerificationCode: verificationCode
              }

    }
    catch(error){

      console.error(error)
        return{ 
            status: 500,
            error: 'Failed to create customer' };
    }
}



//----------SignIn For customer-----------------//
const signInCustomer = async (email, password) => {
    try {
      const customer = await Customer.findOne({ Email: email });
      if (!customer) {
        return {
          status: 400,
          response: 'Email Id did not match',
        };
      }
  
      const isPasswordValid = await bcrypt.compare(password, customer.Password);
      if (!isPasswordValid) {
        return{
          status: 400,
          response: 'Password did not match ',
      }
    }
      return {
        status: 200,
        response: customer,
      };
    } catch (error) {
      throw new Error('Failed to sign in');
    }
  };


  //Forget Password

  const enterEmail = async(email) => {
    try{
      const customer = await Customer.findOne({ Email: email });
      if (!customer) {
        return {
          status: 400,
          response: 'Email Id did not match',
        };
      }

      const verificationCode = crypto.randomBytes(2).toString('hex');

      customer.VerificationCode = verificationCode

      await customer.save(); 

      if(customer.VerificationCode){
        return{
          status:200,
          response: verificationCode,
          message: "Verification code has been sent successfully"
        }
      }
      return{
        status: 400,
        response: error,
        message: "Verification code has not been sent"
      }
  }
  
  catch (error) {
    throw new Error('Failed to sign in');
  }
};


const matchVerificationCodeandResetpassword = async(verificationCode, newPassword, reEnterPassword) =>{
  try {
    // Find the customer by verification code
    const customer = await Customer.findOne({ VerificationCode: verificationCode });
    if (!customer) {
      return {
        status: 400,
        response: 'Verification Code did not match',
      };
    }

    // Check if the new password and re-entered password match
    if(newPassword.length < 8){
      return{
          status:400,
          response: 'Password must be at least 8 characters long',
        };
    }

    if(newPassword !== reEnterPassword){
      return { 
          status: 400,
          response: "Passwords do not match" };
    }

    // Update the customer's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.Password = hashedPassword;
    // customer.VerificationCode = ''; // Clear the verification code
    await customer.save();

    // Return success message or any additional data as needed
    return { 
      status: 200,
      message: 'Password reset successfully' };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to reset password');
  }
}
  




module.exports ={
    createCustomer,
    signInCustomer,
    enterEmail,
    matchVerificationCodeandResetpassword
}