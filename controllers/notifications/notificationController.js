const Notification = require("../../models/notificationModel")


const registerFcmToken = async(req, res) => {
    const { fcmToken } = req.body;
  
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
  
    try {
      const user = new User({ fcmToken });
      await user.save();
      res.status(200).json({ message: 'FCM token saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
}