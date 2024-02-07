const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel.js");
const AppointmentHistory = require("../../models/appointmentHistoryModel.js")

const salonReports = async (req, res, next) => {
    const { salonId } = req.body
    try {
        // Get counts for join queue history
        const serveQueueCount = await JoinedQueueHistory.aggregate([
            {
                $match: {
                    salonId: salonId,
                },
            },
            {
                $unwind: "$queueList",
            },
            {
                $match: {
                    "queueList.status": "served",
                },
            },
            {
                $count: "serveQueueCount",
            },
        ]);

        const cancelledQueueCount = await JoinedQueueHistory.aggregate([
            {
                $match: {
                    salonId: salonId,
                },
            },
            {
                $unwind: "$queueList",
            },
            {
                $match: {
                    "queueList.status": "cancelled",
                },
            },
            {
                $count: "cancelledQueueCount",
            },
        ]);

        // Get counts for appointment history
        const completedAppointmentCount = await AppointmentHistory.aggregate([
            {
                $match: {
                    salonId: salonId,
                },
            },
            {
                $count: "completedAppointmentCount",
            },
        ]);

        res.status(200).json({
            success: true,
            response: {
                serveQueueCount: serveQueueCount.length > 0 ? serveQueueCount[0].serveQueueCount : 0,
                cancelledQueueCount: cancelledQueueCount.length > 0 ? cancelledQueueCount[0].cancelledQueueCount : 0,
                completedAppointmentCount: completedAppointmentCount.length > 0 ? completedAppointmentCount[0].completedAppointmentCount : 0,
            }
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    salonReports
}