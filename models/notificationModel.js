const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
   email:{
    type: String
   },
   sentNotifications:[{
    title:{
        type: String
    },
    body:{
        type: String
    }
   }]
})

const Notification = mongoose.model("Notification",notificationSchema)

module.exports = Notification