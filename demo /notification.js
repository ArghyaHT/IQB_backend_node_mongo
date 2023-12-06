const express = require("express")
const cors = require("cors");
const connectDB = require("./db");
const User = require("./UserModel");
const admin = require('firebase-admin');

connectDB();

const app = express();

app.use(express.json())

app.get("/",(req,res) => {
    res.send("Test")
})

const PORT = 8000;

// Initialize Firebase Admin SDK
const serviceAccount = require("./notification_push_service_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Endpoint for saving FCM token
app.post('/register', async (req, res) => {
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
  });


// Endpoint for sending notifications
app.post('/send-notification', async (req, res) => {
    const { title, body } = req.body;
  
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
  
    try {
      const users = await User.find();
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

app.listen(PORT,() => {
    console.log(`Server is running on PORT:${PORT}`)
})


//Model 
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    fcmToken:{
        type:String
    }
})

const User = mongoose.model("User",userSchema)

module.exports = User

//Important
//There will be a service.json file which will hold the credential of the firebase
//install this package firebase-admin