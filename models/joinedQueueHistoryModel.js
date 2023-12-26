const mongoose = require("mongoose")

const joinqueueHistorySchema = new mongoose.Schema({
    // id:{
    //     type: Number,
    //     required: true
    // },
    salonId: {
        type: Number,
    },

    queueList: [{
        position: {
            type: Number,
        },
        customerName: {
            type: String,
            // required: true
        },
        customerEmail: {
            type: String
        },
        joinedQ: {
            type: Boolean
        },

        joinedQType: {
            type: String,
            enum: ['Single-Join', 'Group-Join', 'Auto-Join']
        },
        dateJoinedQ: {
            type: Date
        },
        timeJoinedQ: {
            type: String
        },
        timePositionChanged: {
            type: String
        },
        loggedIn: {
            type: Boolean
        },
        methodUsed: {
            type: String,
            enum: ['Walk-In', 'Admin', 'App']
        },
        barberName: {
            type: String
        },
        forceUpdate: {
            type: Boolean
        },
        qgCode: {
            type: String
        },
        positionChangedMessageShown: {
            type: Boolean
        },
        logNo: {
            type: String
        },
        lineCreated: {
            type: String
        },
        barberId: {
            type: Number
        },
        serviceId: {
            type: String
        },
        customerEWT: {
            type: Number
        },
        serviceEWT: {
            type: Number
        },
        localLineId: {
            type: Number
        }
    }]

}, { timestamps: true })

const JoinedQueueHistory = mongoose.model("JoinQueueHistory", joinqueueHistorySchema)

module.exports = JoinedQueueHistory;

