const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    fcmToken:{
        type:String
    }
})

const Notification = mongoose.model("Notification",notificationSchema)

module.exports = Notification