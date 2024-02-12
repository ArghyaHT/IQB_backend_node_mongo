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
const sendSms = async(body, numbers) => {
  try{
    // Iterate over each mobile number and send SMS
    for (const number of numbers) {
      // Replace sendSms with your actual SMS sending logic
      await sendSmsLogic(body, number);
    }
    return true; // Return true if SMS sent successfully
  } catch (error) {
    console.log(error);
    return false; // Return false if SMS sending failed
  }
}

const sendSmsLogic = async (body, number) => {
  let msgOptions = {
    from: '+19083491303',
    to: number,
    body
  }
  try{
    const message = await client.messages.create(msgOptions);
    console.log(message)
  }
  catch(error){
    console.log(error)
  }
  console.log(`Sending SMS to ${number}: ${body}`);
}

module.exports = {
  sendSms,
  sendSmsLogic
}