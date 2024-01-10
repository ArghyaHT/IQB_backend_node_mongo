const mongoose = require("mongoose")

const userTokenSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    type:{
        type:String
    },
    // token:[{
    //     fcmToken: {
    //         type: String
    //     },
    //     deviceType:{
    //         type: String
    //     }
    // }]
    webFcmToken : {
        type:String
    },
    androidFcmToken : {
        type:String
    },
    iosFcmToken:{
        type: String
    }
    
    
})

const UserTokenTable = mongoose.model('UserTokenTable', userTokenSchema);

module.exports = UserTokenTable;