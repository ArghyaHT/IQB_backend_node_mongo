const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const SalonSettings = require("../../models/salonSettingsModel")
const moment = require("moment")


//Creating Appointment
const createAppointment = async (req, res) => {
  try {
      const { salonId, barberId, serviceId, appointmentDate, appointmentName, startTime, customerEmail, customerName, customerType, methodUsed } = req.body;

      // Assuming you have your models imported (Barber, Appointment) and other necessary dependencies

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

      // Convert appointmentDate to ISO format (YYYY-MM-DD)
      const [day, month, year] = appointmentDate.split('-');
      const isoFormattedDate = `${year}-${month}-${day}`;

      // Calculate totalServiceEWT in hours and minutes
      const hours = Math.floor(totalServiceEWT / 60);
      const minutes = totalServiceEWT % 60;

      const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

      // Parse startTime from the request body into hours and minutes
      const [startHours, startMinutes] = startTime.split(':').map(Number);

      // Calculate endTime by adding formattedTime to startTime using Moment.js
      const startTimeMoment = moment(`${isoFormattedDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
      const endTimeMoment = startTimeMoment.clone().add(hours, 'hours').add(minutes, 'minutes');
      const endTime = endTimeMoment.format('HH:mm');

      const existingAppointmentList = await Appointment.findOne({ salonId });
      const newAppointment = {
          barberId,
          serviceId: serviceIds, 
          appointmentDate: isoFormattedDate, 
          startTime,
          endTime,
          appointmentName,
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

//Get All Appointments By BarberId
const getAllAppointmentsByBarberId = async(req, res) =>{
  try {
    const { salonId, barberId, appointmentDate } = req.body;

    //finding the appointments according to the barberId and appointmentDate
    const appointments = await Appointment.find({
      salonId: salonId,
      'appointmentList.appointmentDate': appointmentDate,
      'appointmentList.barberId': barberId,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment List Retrieved',
      response: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve the appointments of the barber',
    });
  }

}

//Get Engage BarberTimeSLots Api
const getEngageBarberTimeSlots = async (req, res) => {
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
      // If there are appointments for the specified barber, generate time slots as disabled: true
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


//Function to generate TimeSlots of 30 mins
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


const getAllAppointmentsBySalonId = async (req, res) => {
  try {
      const { salonId } = req.body;

      // Assuming your Appointment and Barber models are properly imported
      const appointments = await Appointment.aggregate([
          { $match: { salonId: salonId } },
          { $unwind: "$appointmentList" },
          {
              $lookup: {
                  from: "barbers", // Assuming your barbers collection name
                  localField: "appointmentList.barberId",
                  foreignField: "barberId",
                  as: "barberInfo"
              }
          },
          {
              $addFields: {
                  "appointmentList.appointmentDate": {
                      $dateToString: {
                          format: "%d/%m/%Y",
                          date: "$appointmentList.appointmentDate"
                      }
                  },
                  "appointmentList.barberName": {
                      $arrayElemAt: ["$barberInfo.name", 0] // Assuming the name field in the barbers collection
                  }
              }
          },
          {
              $group: {
                  _id: "$_id",
                  appointmentList: { $push: "$appointmentList" }
              }
          }
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
          appointments: appointments,
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          success: false,
          error: 'Failed to fetch appointments. Please try again.',
      });
  }
};


const getAllAppointmentsBySalonIdAndDate = async (req, res) => {
  try {
      const { salonId, appointmentDate } = req.body;

      // Convert appointmentDate to ISO format (YYYY-MM-DD)
      const [day, month, year] = appointmentDate.split('/');
      const isoFormattedDate = `${year}-${month}-${day}`;

      // Assuming your Appointment and Barber models are properly imported
      const appointments = await Appointment.aggregate([
          {
              $match: {
                  salonId: salonId,
                  "appointmentList.appointmentDate": {
                      $eq: new Date(isoFormattedDate)
                  }
              }
          },
          { $unwind: "$appointmentList" },
          {
              $match: {
                  "appointmentList.appointmentDate": {
                      $eq: new Date(isoFormattedDate)
                  }
              }
          },
          {
              $lookup: {
                  from: "barbers", // Assuming your barbers collection name
                  localField: "appointmentList.barberId",
                  foreignField: "barberId",
                  as: "barberInfo"
              }
          },
          {
              $addFields: {
                  "appointmentList.appointmentDate": {
                      $dateToString: {
                          format: "%d/%m/%Y",
                          date: "$appointmentList.appointmentDate"
                      }
                  },
                  "appointmentList.barberName": {
                      $arrayElemAt: ["$barberInfo.name", 0] // Assuming the name field in the barbers collection
                  }
              }
          },
          {
              $group: {
                  _id: "$_id",
                  appointmentList: { $push: "$appointmentList" }
              }
          }
      ]);

      if (!appointments || appointments.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No appointments found for the provided salon ID and date',
              appointments: [],
          });
      }

      res.status(200).json({
          success: true,
          message: 'Appointments retrieved successfully',
          appointments: appointments,
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          success: false,
          error: 'Failed to fetch appointments. Please try again.',
      });
  }
};

// {
//   id: createEventId(),
//   title: 'Appoinment 1',
//   start: todayStr + 'T09:0:00',
//   // end: todayStr + 'T10:00:00',
//   color:"#7EC8E3" //sky blue
// },

module.exports = {
    createAppointment,
    getAllAppointmentsByBarberId,
    getEngageBarberTimeSlots,
    getAllAppointmentsBySalonId,
    getAllAppointmentsBySalonIdAndDate
}