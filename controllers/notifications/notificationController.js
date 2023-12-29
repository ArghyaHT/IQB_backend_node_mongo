const Notification = require("../../models/notificationModel")
const admin = require('firebase-admin');


// Endpoint for saving FCM token
const registerFcmToken = async(req, res) => {
    const { fcmToken } = req.body;
  
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
  
    try {
      const user = new Notification({ fcmToken });
      await user.save();
      res.status(200).json({ 
        success: true,
        message: 'FCM token saved successfully'
     });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error'
     });
    }
}

// Endpoint for sending notifications
const sendNotification = async(req, res) => {
    const { title, body } = req.body;
  
    if (!title || !body) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and body are required' });
    }
  
    try {
      const users = await Notification.find();
      const registrationTokens = users.map((user) => user.fcmToken);
  
      const message = {
        notification: {
          title,
          body,
        },
        tokens: registrationTokens, // Pass tokens as an array
      };
  
      const response = await admin.messaging().sendMulticast(message);
      console.log('Notification sent:', response);
      res.status(200).json({ 
        success: true,
        message: 'Notification sent successfully',
      response: response  });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
      error: error });
    }
}

module.exports = {
  registerFcmToken,
  sendNotification,
}