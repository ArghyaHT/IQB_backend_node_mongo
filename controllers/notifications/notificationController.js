const Customer = require("../../models/customerRegisterModel");
const Notification = require("../../models/notificationModel")
const admin = require('firebase-admin');

// fcmToken:{
//   type:String
// }


// Endpoint for saving FCM token
// const registerFcmToken = async(req, res) => {
//     const { fcmToken } = req.body;
  
//     if (!fcmToken) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'FCM token is required' });
//     }
  
//     try {
//       const user = new Notification({ fcmToken });
//       await user.save();
//       res.status(200).json({ 
//         success: true,
//         message: 'FCM token saved successfully'
//      });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ 
//         success: false,
//         message: 'Internal server error'
//      });
//     }
// }

app.post('/notificationregister', async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ error: 'FCM token is required' });
  }

  try {
    const user = new Customer({ fcmToken });
    await user.save();
    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for sending notifications
// const sendNotification = async(req, res) => {
//     const { title, body } = req.body;
  
//     if (!title || !body) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Title and body are required' });
//     }
  
//     try {
//       const users = await Customer.find();
//       const registrationTokens = users.map((user) => user.fcmToken);
  
//       const message = {
//         notification: {
//           title,
//           body,
//         },
//         tokens: registrationTokens, // Pass tokens as an array
//       };
  
//       const response = await admin.messaging().sendMulticast(message);
//       console.log('Notification sent:', response);
//       res.status(200).json({ 
//         success: true,
//         message: 'Notification sent successfully',
//       response: response  });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ 
//         success: false,
//         message: 'Internal server error',
//       error: error });
//     }
// }
app.post('/send-notification', async (req, res) => {
    const { title, body } = req.body;
  
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
  
    try {
      const users = await Customer.find();
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
      res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// module.exports = {
// //   registerFcmToken,
// //   sendNotification,
// }