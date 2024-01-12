const twilio = require('twilio');
 require("dotenv").config();
const accountSid = process.env.TWILIO_ACC_SID ; // Your Twilio account SID
  const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio trail auth token
  const twilioPhoneNumber = process.env.TWILIO_NO; // Your Twilio phone number

  const client =  twilio(accountSid, authToken);

// // Function to send verification code using Twilio
// const sendVerificationCodeToMobile = async (mobileNumber, verificationCode) => {
// 
//   try {
//     

//     const message = await client.messages.create({
//       body: `Your verification code is: ${verificationCode}`,
//       from: twilioPhoneNumber,
//       to: mobileNumber,
//     });

//     console.log('Message sent:', message.sid);
//     return message;
//   } catch (error) {
//     console.error('Error sending verification code:', error);
//     throw new Error('Failed to send verification code');
//   }
// };

//Function to send sms via twilio
const sendSms = async(body) => {
  let msgOptions = {
    from: '+19083491303',
    to: "+41796698395",
    body
  }
  try{
    const message = await client.messages.create(msgOptions);
    console.log(message)
  }
  catch(error){
    console.log(error)
  }
}

module.exports = {
  sendSms,
};