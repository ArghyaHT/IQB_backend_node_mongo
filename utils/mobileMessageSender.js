const axios = require('axios');

// Function to send verification code
const sendVerificationCodeToMobile = async(mobileNumber, verificationCode)=> {
  const apiKey = 'BY6qBfYt0GwwXu62WRancbNX4FUtvmIII6BvvBn1FUhw7cGQYR3eLlDjPn7T';
  const senderId = 'FSTSMS';
  const message = `Your verification code is: ${verificationCode}`;

  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        sender_id: senderId,
        message: message,
        language: 'english',
        route: 'otp',
        numbers: mobileNumber,
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending verification code:', error.response.data);
    throw new Error('Failed to send verification code');
  }
}
module.exports ={
    sendVerificationCodeToMobile,
}
