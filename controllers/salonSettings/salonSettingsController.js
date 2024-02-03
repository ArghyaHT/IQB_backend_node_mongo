const SalonSettings = require("../../models/salonSettingsModel")
const Appointment = require("../../models/appointmentsModel")

const createSalonSettings = async (req, res, next) => {
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
    }catch (error) {
        console.log(error);
        next(error);
      }
}

const getSalonSettings = async (req, res, next) => {
    try{
        const {salonId} = req. body;
        // Find the existing SalonSettings document based on salonId
        let existingSalonSettings = await SalonSettings.findOne({ salonId });

        if (!existingSalonSettings) {
            return res.status(404).json({ 
                message: "Salon Settings not found"
             });
        }
        res.status(200).json({
            message: "Salon Settings Updated",
            response: existingSalonSettings
        });

    }catch (error) {
        console.log(error);
        next(error);
      }
}

const updateSalonSettings = async (req, res, next) => {
    try {
        const { salonId, appointmentSettings } = req.body;
        const { startTime, endTime } = appointmentSettings;

        // Find the existing SalonSettings document based on salonId
        let existingSalonSettings = await SalonSettings.findOne({ salonId });

        if (!existingSalonSettings) {
            return res.status(404).json({ 
                message: "Salon Settings not found"
             });
        }


        // Update the appointment settings if provided in the request
        if (startTime && endTime) {
            existingSalonSettings.appointmentSettings.appointmentStartTime = startTime;
            existingSalonSettings.appointmentSettings.appointmentEndTime = endTime;
        }

        // Save the updated SalonSettings to the database
        await existingSalonSettings.save();

        res.status(200).json({
            message: "Salon Settings Updated",
            response: existingSalonSettings
        });
    } catch (error) {
        console.log(error);
        next(error);
      }
};

const deleteSalonSettings = async (req, res) => {
    res.send("this is delete salon settings route")
}




module.exports = {
    createSalonSettings,
    getSalonSettings,
    updateSalonSettings,
    deleteSalonSettings,
}