const mongoose = require("mongoose")

const notificationSchema = mongoose.Schema({
    fcmToken:{
        type:String
    }
})

const Notification = mongoose.model("Notification",notificationSchema)

module.exports = Notification