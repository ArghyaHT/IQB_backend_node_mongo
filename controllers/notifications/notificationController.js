const Customer = require("../../models/customerRegisterModel");
const Notification = require("../../models/notificationModel")
const admin = require('firebase-admin');
const UserTokenTable = require("../../models/userTokenModel");

//This is for web notification 
const sendNotification = async (req, res, next) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required' });
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
    console.log(error);
    next(error);
  }
}

//Sendf multiple Tokens
const multiplesendNotification = async(req, res, next) =>{
  const { title, body, emails } = req.body;

  if (!title || !body || !emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({success: false, message: 'Title, body, and valid emails array are required' });
  }

  try {
    const users = await UserTokenTable.find({ email: { $in: emails } });
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

    const response = await admin.messaging().sendEachForMulticast(message);
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
      message: 'Notifications sent and saved successfully'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

const getAllNotifications = async (req, res, next) => {
  const { email } = req.body;

       // Validate email format
       if (!email || !validateEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

  try {
    const notifications = await Notification.findOne({ email });

    if (!notifications) {
      return res.status(201).json({ 
        success: false,
        message: 'No notifications found for this email' });
    }
   // Reverse the order of notifications
  const latestnotifications = notifications.sentNotifications.reverse();

    res.status(200).json({
      success: true,
      response:{
        _id: notifications._id,
        email: notifications.email,
        sentNotifications: latestnotifications
      }
     });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Send notification to android
const sendNotificationToAndroid = async (req, res, next) => {
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
    console.log(error);
    next(error);
  }
};

module.exports = {
  //   registerFcmToken,
  sendNotification,
  getAllNotifications,
  sendNotificationToAndroid,
  multiplesendNotification
}