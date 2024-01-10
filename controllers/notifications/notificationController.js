const Customer = require("../../models/customerRegisterModel");
const Notification = require("../../models/notificationModel")
const admin = require('firebase-admin');
const UserTokenTable = require("../../models/userTokenModel");

// fcmToken:{
//   type:String
// }
// dev


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

// app.post('/notificationregister', async (req, res) => {
//   const { fcmToken } = req.body;

//   if (!fcmToken) {
//     return res.status(400).json({ error: 'FCM token is required' });
//   }

//   try {
//     const user = new Customer({ fcmToken });
//     await user.save();
//     res.status(200).json({ message: 'FCM token saved successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

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

// app.post('/send-notification', async (req, res) => {
//     const { title, body } = req.body;

//     if (!title || !body) {
//       return res.status(400).json({ error: 'Title and body are required' });
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
//       //ai response take akta notification table save kore dibi .
//       res.status(200).json({ message: 'Notification sent successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });


//This is for web notification 
const sendNotification = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  try {
    const users = await UserTokenTable.find();
    const registrationTokens = users.reduce((tokens, user) => {
      if (user.webFcmToken) tokens.push(user.webFcmToken);
      if (user.androidFcmToken) tokens.push(user.androidFcmToken);
      if (user.iosFcmToken) tokens.push(user.iosFcmToken);
      return tokens;
    }, []);

    const message = {
      notification: {
        title,
        body,
      },
      tokens: registrationTokens, // Pass tokens as an array
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Notification sent:', response);

    for (const user of users) {
      const existingNotification = await Notification.findOne({ email: user.email });

      if (existingNotification) {
        // Email already exists, update the existing document
        await Notification.findOneAndUpdate(
          { email: user.email },
          { $push: { sentNotifications: { title, body } } }
        );
      } else {
        // Email doesn't exist, create a new document
        await Notification.create({ email: user.email, sentNotifications: [{ title, body }] });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk notifications sent and saved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

const getAllNotifications = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Proper Email Id required' });
  }

  try {
    const notifications = await Notification.findOne({ email });

    if (!notifications) {
      return res.status(404).json({ 
        success: false,
        message: 'No notifications found for this email' });
    }

    res.status(200).json({
      success: true,
      response:notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success:false,
      message: 'Internal server error',
     error: error.message});
  }
};

//Send notification to android
const sendNotificationToAndroid = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  try {
    const androidUsers = await UserTokenTable.find({ androidFcmToken: { $exists: true } });

    if (androidUsers.length === 0) {
      return res.status(400).json({ error: 'No Android users found' });
    }

    const androidTokens = androidUsers.map(user => user.androidFcmToken);

    const message = {
      notification: {
        title,
        body,
      },
      tokens: androidTokens, // Pass Android FCM tokens as an array
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Notification sent to Android devices:', response);

    for (const androidUser of androidUsers) {
      const existingNotification = await Notification.findOne({ email: androidUser.email });

      if (existingNotification) {
        // Email already exists, update the existing document
        await Notification.findOneAndUpdate(
          { email: androidUser.email },
          { $push: { sentNotifications: { title, body } } }
        );
      } else {
        // Email doesn't exist, create a new document
        await Notification.create({ email: androidUser.email, sentNotifications: [{ title, body }] });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Notifications sent to Android devices and saved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  //   registerFcmToken,
  sendNotification,
  getAllNotifications,
  sendNotificationToAndroid,
}