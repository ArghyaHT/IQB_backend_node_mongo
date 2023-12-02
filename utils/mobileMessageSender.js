const twilio = require('twilio');

// Function to send verification code using Twilio
const sendVerificationCodeToMobile = async (mobileNumber, verificationCode) => {
  const accountSid = 'YOUR_ACCOUNT_SID'; // Your Twilio account SID
  const authToken = 'YOUR_AUTH_TOKEN'; // Your Twilio auth token
  const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER'; // Your Twilio phone number

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: twilioPhoneNumber,
      to: mobileNumber,
    });

    console.log('Message sent:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw new Error('Failed to send verification code');
  }
};

module.exports = {
  sendVerificationCodeToMobile,
};