const mongoose = require("mongoose")

const joinqueueSchema = new mongoose.Schema({
    // id:{
    //     type: Number,
    //     required: true
    // },
    salonId:{
        type: Number,
        required: true
    },
    position:{
        type:Number,
    },
    userName:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
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
    methodeUsed:{
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
    barberEWT:{
        type: Number
    },
    localLineId:{
        type: Number
    }
},{timestamps: true})

const JoinedQueue = mongoose.model("JoinQueue", joinqueueSchema)

module.exports = JoinedQueue

