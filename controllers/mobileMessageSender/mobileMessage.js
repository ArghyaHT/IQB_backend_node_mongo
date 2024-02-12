const { sendSms } = require("../../utils/mobileMessageSender");

const sendQSms = async(req, res, next) => {
    try{
      const {body, mobileNumber} = req.body;
         // Convert mobileNumber to an array if it's not already an array
    const numbers = Array.isArray(mobileNumber) ? mobileNumber : [mobileNumber];
    const smsSent = await sendSms(body, numbers);

    if (smsSent) {
      res.status(200).json({
        success: true,
        message: "SMS sent successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send SMS"
      });
    }
    }
    catch (error) {
      console.log(error);
      next(error);
    }
  }

  module.exports = {
    sendQSms
  }