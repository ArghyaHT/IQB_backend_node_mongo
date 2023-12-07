const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    fcmToken:{
        type:String
    }
})

const User = mongoose.model("User",userSchema)

module.exports = User