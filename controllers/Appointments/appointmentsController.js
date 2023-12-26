const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const SalonSettings = require("../../models/salonSettingsModel")
const moment = require("moment")


//Creating Appointment
const createAppointment = async (req, res) => {
  try {
      const { salonId, barberId, serviceId, appointmentDate, appointmentNotes, startTime, customerEmail, customerName, customerType, methodUsed } = req.body;

      // Fetch barber information
      const barber = await Barber.findOne({ barberId: barberId });
    
      // Calculate total serviceEWT for all provided serviceIds
      let totalServiceEWT = 0;
      let serviceIds = "";
      if (barber && barber.barberServices) {
          // Convert single serviceId to an array if it's not already an array
          const services = Array.isArray(serviceId) ? serviceId : [serviceId];
        
          services.forEach(id => {
              const service = barber.barberServices.find(service => service.serviceId === id);
              if (service) {
                  totalServiceEWT += service.barberServiceEWT || 0;
            
                  if (serviceIds) {
                      serviceIds += "-";
                  }
                  serviceIds += service.serviceId.toString();
              }
          });
      }

      // Calculate totalServiceEWT in hours and minutes
      const hours = Math.floor(totalServiceEWT / 60);
      const minutes = totalServiceEWT % 60;

      const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

      // Parse startTime from the request body into hours and minutes
      const [startHours, startMinutes] = startTime.split(':').map(Number);

      // Calculate endTime by adding formattedTime to startTime using Moment.js
      const startTimeMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
      const endTimeMoment = startTimeMoment.clone().add(hours, 'hours').add(minutes, 'minutes');
      const endTime = endTimeMoment.format('HH:mm');

      const existingAppointmentList = await Appointment.findOne({ salonId });
      const newAppointment = {
          barberId,
          serviceId: serviceIds, 
          appointmentDate, 
          startTime,
          endTime,
          appointmentNotes,
          timeSlots: `${startTime}-${endTime}`, 
          customerEmail,
          customerName, 
          customerType,
          methodUsed,
      };

      if (existingAppointmentList) {
          existingAppointmentList.appointmentList.push(newAppointment);
          await existingAppointmentList.save();
          res.status(200).json({
              success: true,
              message: "Appointment Confirmed",
              response: existingAppointmentList,
          });
      } else {
          const newAppointmentData = new Appointment({
              salonId: salonId,
              appointmentList: [newAppointment],
          });
          const savedAppointment = await newAppointmentData.save();
          res.status(200).json({
              success: true,
              message: "Appointment Confirmed",
              response: savedAppointment,
          });
      }

  } catch (error) {
      console.log(error);
      res.status(500).json({
          success: false,
          message: 'Your appointment is not done. Please Try Again',
          error: error.message,
      });
  }
};

//Edit Appointments By Admin and Barber
const editAppointment = async (req, res) => {
  try {
    const { appointmentId, salonId, barberId, serviceId, appointmentDate, appointmentNotes, startTime } = req.body; // Assuming appointmentId is passed as a parameter

    // Fetch barber information
    const barber = await Barber.findOne({ barberId: barberId });
    // Calculate total serviceEWT for all provided serviceIds
    let totalServiceEWT = 0;
    let serviceIds = "";
    if (barber && barber.barberServices) {
        // Convert single serviceId to an array if it's not already an array
        const services = Array.isArray(serviceId) ? serviceId : [serviceId];
      
        services.forEach(id => {
            const service = barber.barberServices.find(service => service.serviceId === id);
            if (service) {
                totalServiceEWT += service.barberServiceEWT || 0;
          
                if (serviceIds) {
                    serviceIds += "-";
                }
                serviceIds += service.serviceId.toString();
            }
        });
    }

    // Calculate totalServiceEWT in hours and minutes
    const hours = Math.floor(totalServiceEWT / 60);
    const minutes = totalServiceEWT % 60;

    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    // Parse startTime from the request body into hours and minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);

    // Calculate endTime by adding formattedTime to startTime using Moment.js
    const startTimeMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endTimeMoment = startTimeMoment.clone().add(hours, 'hours').add(minutes, 'minutes');
    const endTime = endTimeMoment.format('HH:mm');
    
    // Fetch the appointment by its ID
    const existingAppointment = await Appointment.findOneAndUpdate(
      { salonId, 'appointmentList._id': appointmentId },
      {
        $set: {
          'appointmentList.$.barberId': barberId,
          'appointmentList.$.serviceId': serviceIds,
          'appointmentList.$.appointmentDate': appointmentDate,
          'appointmentList.$.appointmentNotes': appointmentNotes,
          'appointmentList.$.startTime': startTime,
          'appointmentList.$.endTime': endTime,
          'appointmentList.$.timeSlots': `${startTime}-${endTime}`
          // Update other fields as needed
        },
      },
      { new: true }
    );

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      response: existingAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message,
    });
  }
};

//Delete Appointment
const deleteAppointment = async (req, res) => {
  try {
    const {salonId, appointmentId} = req.body; // Assuming appointmentId is passed as a parameter
    
    // Find and remove the appointment by its ID
    const deletedAppointment = await Appointment.findOneAndUpdate(
      { salonId, 'appointmentList._id': appointmentId },
      {
        $pull: {
          appointmentList: { _id: appointmentId },
        },
      },
      { new: true }
    );

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message,
    });
  }
};

//Get Engage BarberTimeSLots Api
const getEngageBarberTimeSlots = async (req, res) => {
  try {
    const { salonId, barberId, date } = req.body;

    if (!date || !barberId) {
      // If the date value is null, send a response to choose the date
      return res.status(400).json({
        message: 'Please choose a Date and Barber to fetch time slots'
      });
    }

    // Getting the appointments for a Specific Barber
    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(date)
          },
          "appointmentList.barberId": barberId
        }
      },
      {
        $unwind: "$appointmentList"
      },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(date)
          },
          "appointmentList.barberId": barberId
        }
      },
    ]);

    let timeSlots = [];

    if (!appointments || appointments.length === 0) {
      // Generate time slots for the entire working hours as no appointments found
      const { appointmentSettings } = await SalonSettings.findOne({ salonId });
      const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

      //Generate the timeslots for the barber If no appointments
      const start = moment(appointmentStartTime, 'HH:mm');
      const end = moment(appointmentEndTime, 'HH:mm');

      const settings = await SalonSettings.findOne({ salonId: salonId });

      if (!settings) {
        console.log('Salon settings not found');
        return null;
      }
      const intervalInMinutes = settings.appointmentSettings.intervalInMinutes;
      console.log('Interval in minutes:', intervalInMinutes);
      
      timeSlots = generateTimeSlots(start, end, intervalInMinutes);
    } else {
      const appointmentList = appointments.map(appt => appt.appointmentList);

      // Generate time slots for the barber If have appointments
      const { appointmentSettings } = await SalonSettings.findOne({ salonId });
      const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

      const start = moment(appointmentStartTime, 'HH:mm');
      const end = moment(appointmentEndTime, 'HH:mm');

      timeSlots = generateTimeSlots(start, end);

      appointmentList.forEach(appointment => {
        const slotsInRange = appointment.timeSlots.split('-');
        const rangeStart = moment(slotsInRange[0], 'HH:mm');
        const rangeEnd = moment(slotsInRange[1], 'HH:mm');

        timeSlots = timeSlots.map(slot => {
          const slotTime = moment(slot.timeInterval, 'HH:mm');
          if (slotTime.isBetween(rangeStart, rangeEnd) || slotTime.isSame(rangeStart) || slotTime.isSame(rangeEnd)) {
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
      error: error.message
    });
  }
};

//Function to generate TimeSlots of 30 mins
function generateTimeSlots(start, end, intervalInMinutes) {
  const timeSlots = [];
  let currentTime = moment(start);

  while (currentTime < end) {
      const timeInterval = currentTime.format('HH:mm');
      timeSlots.push({ timeInterval, disabled: false });
      currentTime.add(intervalInMinutes, 'minutes'); // Increment by 30 minutes
  }

  return timeSlots;
}


//Get All Appointments by SalonId
const getAllAppointmentsBySalonId = async (req, res) => {
  try {
    const { salonId } = req.body;

    const appointments = await Appointment.aggregate([
      { $match: { salonId: salonId } },
      { $unwind: "$appointmentList" },
      {
        $lookup: {
          from: "barbers",
          localField: "appointmentList.barberId",
          foreignField: "barberId",
          as: "barberInfo"
        }
      },
      {
        $addFields: {
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          },
          "appointmentList.appointmentDate": {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$appointmentList.appointmentDate"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          "appointmentList._id": 1,
          "appointmentList.appointmentDate": 1,
          "appointmentList.appointmentName": 1,
          "appointmentList.startTime": 1,
          "appointmentList.endTime": 1,
          "appointmentList.timeSlots": 1,
          "appointmentList.barberName": 1
          // Include other fields if needed
        }
      },
      { $sort: { "appointmentList.appointmentDate": 1 } }
    ]);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for the provided salon ID',
        appointments: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      response: appointments.map(appointment => appointment.appointmentList),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments. Please try again.',
    });
  }
};


//Get All Appointments By SalonId and Date
const getAllAppointmentsBySalonIdAndDate = async (req, res) => {
  try {
    const { salonId, appointmentDate } = req.body;

    // Convert appointmentDate to ISO format (YYYY-MM-DD)

    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
          }
        }
      },
      {
        $unwind: "$appointmentList"
      },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
          }
        }
      },
      {
        $lookup: {
          from: "barbers",
          localField: "appointmentList.barberId",
          foreignField: "barberId",
          as: "barberInfo"
        }
      },
      {
        $addFields: {
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          },
          "appointmentList.background": "#FFFFFF", // Set your default color here
          "appointmentList.startTime": "$appointmentList.startTime",
          "appointmentList.endTime": "$appointmentList.endTime"
        }
      },
      {
        $group: {
          _id: "$appointmentList.barberId",
          barbername: { $first: "$appointmentList.barberName" },
          appointments: { $push: "$appointmentList" }
        }
      },
      {
        $project: {
          barbername: 1,
          appointments: 1,
          _id: 0
        }
      },
      {
        $sort: {
          barbername: 1 // Sort by barberName in ascending order
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      response: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments. Please try again.',
      error: error.message
    });
  }
};

// Get all appointments by salonid and barberid
const getAllAppointmentsByBarberId = async (req, res) => {
  try {
    const { salonId, barberId } = req.body;

    const appointments = await Appointment.aggregate([
      { $match: { salonId: salonId } },
      { $unwind: "$appointmentList" },
      {
        $match: {
          "appointmentList.barberId": barberId
        }
      },
      {
        $lookup: {
          from: "barbers",
          localField: "appointmentList.barberId",
          foreignField: "barberId",
          as: "barberInfo"
        }
      },
      {
        $addFields: {
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          },
          "appointmentList.appointmentDate": {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$appointmentList.appointmentDate"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          "appointmentList._id": 1,
          "appointmentList.appointmentDate": 1,
          "appointmentList.appointmentName": 1,
          "appointmentList.startTime": 1,
          "appointmentList.endTime": 1,
          "appointmentList.timeSlots": 1,
          "appointmentList.barberName": 1
          // Include other fields if needed
        }
      },
      { $sort: { "appointmentList.appointmentDate": 1 } }
    ]);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for the provided salon and barber ID',
        appointments: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      response: appointments.map(appointment => appointment.appointmentList),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments. Please try again.',
    });
  }
};


//Get All Appointments By SalonId and Date
const getAllAppointmentsByBarberIdAndDate = async (req, res) => {
  try {
    const { salonId, barberId, appointmentDate } = req.body;

    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
          },
          "appointmentList.barberId": barberId
        }
      },
      { $unwind: "$appointmentList" },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
          },
          "appointmentList.barberId": barberId
        }
      },
      {
        $lookup: {
          from: "barbers",
          localField: "appointmentList.barberId",
          foreignField: "barberId",
          as: "barberInfo"
        }
      },
      {
        $addFields: {
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          }
        }
      },
      {
        $group: {
          _id: "$appointmentList.barberId",
          barbername: { $first: "$appointmentList.barberName" },
          appointments: { $push: "$appointmentList" }
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          barbername: 1,
          barberId: 1,
          appointments: 1
        }
      }
    ]);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for the provided salon ID, barber ID, and date',
        response: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      response: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments. Please try again.',
      error: error.message
    });
  }
};

module.exports = {
    createAppointment,
    editAppointment,
    deleteAppointment,
    getAllAppointmentsByBarberId,
    getEngageBarberTimeSlots,
    getAllAppointmentsBySalonId,
    getAllAppointmentsBySalonIdAndDate,
    getAllAppointmentsByBarberIdAndDate, 
    
}

