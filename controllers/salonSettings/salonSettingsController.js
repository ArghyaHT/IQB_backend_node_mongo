const SalonSettings = require("../../models/salonSettingsModel")
const Appointment = require("../../models/appointmentsModel")
const moment = require("moment")

const createSalonSettings = async (req, res) => {
    try {
        const { salonId, appointmentSettings } = req.body;
        const { startTime, endTime } = appointmentSettings;

        // Create a new SalonSettings instance with generated time slots
        const newSalonSettings = new SalonSettings({
            salonId,
            appointmentSettings: {
                appointmentStartTime: startTime,
                appointmentEndTime: endTime,
            }
        });

        // Save the new SalonSettings to the database
        await newSalonSettings.save();

        res.status(200).json({
            message: "Salon Settings Created",
            response: newSalonSettings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create salon settings', details: error.message });
    }
}


// const getTimeSlots = async (req, res) => {
//     try {
//         const { salonId, barberId, date } = req.body;

//         // Retrieve appointments for the specified salonId, barberId, and date
//         const appointments = await Appointment.findOne({
//             salonId: salonId,
//             "appointmentList.barberId": barberId,
//             "appointmentList.appointmentDate": new Date(date)
//         });

//         if (!appointments) {
//             return res.status(404).json({
//                 error: 'Appointments not found for the specified salonId, barberId, and date'
//             });
//         }

//         const appointmentList = appointments.appointmentList;

//         // Retrieve salon settings based on salonId
//         const salon = await SalonSettings.findOne({ salonId });

//         if (!salon) {
//             return res.status(404).json({
//                 error: 'Salon settings not found for the specified salonId'
//             });
//         }

//         const { appointmentSettings } = salon;
//         const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

//         // Create moment objects from provided start and end times
//         const start = moment(appointmentStartTime, 'HH:mm');
//         const end = moment(appointmentEndTime, 'HH:mm');

//         // Generate time slots based on the appointment start and end times
       

//         // const updatedTimeSlots = [...timeSlots]; // Initialize with all time slots enabled
//         let timeSlotsByAppointment = [];
//         appointmentList.forEach(appointment => {
//             const slotsInRange = appointment.timeSlots.split('-');
//             const rangeStart = moment(slotsInRange[0], 'HH:mm');
//             const rangeEnd = moment(slotsInRange[1], 'HH:mm');

//             const rangeStartTime = moment(rangeStart.format('HH:mm'), 'HH:mm');
//             const rangeEndTime = moment(rangeEnd.format('HH:mm'), 'HH:mm');
//             const timeSlots = generateTimeSlots(start, end, rangeStartTime, rangeEndTime);
//             timeSlotsByAppointment = timeSlotsByAppointment.concat(timeSlots); 
//             // updatedTimeSlots.forEach((slot, index) => {
//             //     const DISABLED_MARKER = "Disabled"
//             //     if (moment(slot, 'HH:mm').isBetween(rangeStartTime, rangeEndTime, undefined, '[]')) {
//             //         updatedTimeSlots[index] = `${slot}:${DISABLED_MARKER}`; // Mark slot as disabled if it falls within the range
//             //     }
//             // });
           
//         });

//         res.status(200).json({
//             message: "Time slots retrieved and matched successfully",
//             timeSlots: timeSlotsByAppointment
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch time slots',
//             details: error.message
//         });
//     }
// };
// function generateTimeSlots(start, end, rangeStartTime, rangeEndTime) {
//     const timeSlots = [];
//     let currentTime = moment(start);

//     // Add time slots at 30-minute intervals until the end time is reached
//     while (currentTime < end) {
//         const timeSlot = { timeInterval: currentTime.format('HH:mm'), disabled: false };
//         if (moment(timeSlot.timeInterval, 'HH:mm').isBetween(rangeStartTime, rangeEndTime, undefined, '[]')) {
//             timeSlot.disabled = true;
//         }
//         timeSlots.push(timeSlot);
//         currentTime.add(30, 'minutes'); // Increment by 30 minutes
//     }

//     return timeSlots;
// }


const getTimeSlots = async (req, res) => {
    try {
        const { salonId, barberId, date } = req.body;

        // Retrieve appointments for the specified salonId, barberId, and date
        const appointments = await Appointment.findOne({
            salonId: salonId,
            "appointmentList.barberId": barberId,
            "appointmentList.appointmentDate": new Date(date)
        });

        let timeSlots = [];

        if (!appointments) {
            // If there are no appointments for the specified barber, generate time slots as disabled: false
            const { appointmentSettings } = await SalonSettings.findOne({ salonId });
            const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

            const start = moment(appointmentStartTime, 'HH:mm');
            const end = moment(appointmentEndTime, 'HH:mm');

            timeSlots = generateTimeSlots(start, end);
        } else {
            const appointmentList = appointments.appointmentList;

            const { appointmentSettings } = await SalonSettings.findOne({ salonId });
            const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

            const start = moment(appointmentStartTime, 'HH:mm');
            const end = moment(appointmentEndTime, 'HH:mm');

            timeSlots = generateTimeSlots(start, end);

            appointmentList.forEach(appointment => {
                const slotsInRange = appointment.timeSlots.split('-');
                const rangeStart = moment(slotsInRange[0], 'HH:mm');
                const rangeEnd = moment(slotsInRange[1], 'HH:mm');

                const rangeStartTime = moment(rangeStart.format('HH:mm'), 'HH:mm');
                const rangeEndTime = moment(rangeEnd.format('HH:mm'), 'HH:mm');

                timeSlots = timeSlots.map(slot => {
                    if (moment(slot.timeInterval, 'HH:mm').isBetween(rangeStartTime, rangeEndTime, undefined, '[]')) {
                        return { ...slot, disabled: true };
                    }
                    return slot;
                });
            });
        }

        res.status(200).json({
            message: "Time slots retrieved and matched successfully",
            timeSlots: timeSlots
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch time slots',
            details: error.message
        });
    }
};

function generateTimeSlots(start, end) {
    const timeSlots = [];
    let currentTime = moment(start);

    while (currentTime < end) {
        const timeInterval = currentTime.format('HH:mm');
        timeSlots.push({ timeInterval, disabled: false });
        currentTime.add(30, 'minutes'); // Increment by 30 minutes
    }

    return timeSlots;
}


const getSalonSettings = async (req, res) => {
    res.send("this is get salon Settings route ")
}

const updateSalonSettings = async (req, res) => {
    res.send("this is update salon settings route")
}

const deleteSalonSettings = async (req, res) => {
    res.send("this is delete salon settings route")
}




module.exports = {
    createSalonSettings,
    getSalonSettings,
    updateSalonSettings,
    deleteSalonSettings,
    getTimeSlots,
}