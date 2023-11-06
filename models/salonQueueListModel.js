const mongoose = require("mongoose")

const salonQueueListSchema = new mongoose.Schema({
    // id:{
    //     type: Number,
    //     required: true
    // },
    salonId:{
        type: Number,
        required: true
    },

    queueList: [{
        position:{
            type:Number,
        },
        userName:{
            type: String,
            // required: true
        },
        name:{
            type: String,
            // required: true
        },
        joinedQ:{
            type:Boolean 
        },
    
        joinedQType:{
            type: String,
            enum: ['Single-Join', 'Group-Join', 'Auto-Join']
        },
        dateJoinedQ:{
            type: Date
        },
        timeJoinedQ:{
            type: String
        },
        timePositionChanged:{
            type: String
        },
        loggedIn:{
            type: Boolean
        },
        methodUsed:{
            type: String,
            enum: ['Walk-In', 'Admin', 'App']
        },
        barberName:{
            type:String
        },
        forceUpdate:{
            type: Boolean
        },
        qgCode:{
            type:String
        },
        qPosition:{
            type: Number
        },
        positionChangedMessageShown:{
            type: Boolean
        },
        logNo:{
            type: String
        },
        lineCreated:{
            type: String
        },
        barberId:{
            type: Number
        },
        serviceId:{
            type: Number
        },
        serviceName:{
            type: String
        },
        customerEWT:{
            type: Number
        },
        localLineId:{
            type: Number
        }
    }]
   
},{timestamps: true})

const SalonQueueList = mongoose.model("SalonQueueList", salonQueueListSchema)

module.exports = SalonQueueList

