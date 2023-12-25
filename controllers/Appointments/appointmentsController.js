const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const SalonSettings = require("../../models/salonSettingsModel")
const moment = require("moment")


//Creating Appointment
const createAppointment = async (req, res) => {
  try {
      const { salonId, barberId, serviceId, appointmentDate, appointmentNotes, startTime, customerEmail, customerName, customerType, methodUsed } = req.body;

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
    getAllAppointmentsBySalonIdAndDate,
    getAllAppointmentsByBarberIdAndDate
}


// const appoinments = [
//   {
//       title: "B",
//       barbername: "John",
//       event: [
//           {
//               event: "B1",
//               background: "#87CEEB",//sky blue,
//               startTime:"8:00",
//               endTime: "9:00"
//           },
//           {
//               event: "B2",
//               background: "#FFA500",//orange,
//               startTime:"10:00",
//               endTime: "11:00"
//           },
//           {
//               event: "B3",
//               background: "#FA86C4",//pink,
//               startTime:"12:00",
//               endTime: "1:00"
//           },
//           {
//               event: "B4",
//               background: "#15F4EE", //flurocent blue
//               startTime:"3:00",
//               endTime: "4:00"
//           },
//           {
//               event: "B1",
//               background: "#c5e3e7", //grayish blue,
//               startTime:"2:00",
//               endTime: "2:30"
//           },
//           {
//               event: "B2",
//               background: "#87CEEB",//sky blue
//               startTime:"11:00",
//               endTime: "11:30"
//           },
//           {
//               event: "B3",
//               background: "#FA86C4",//pink
//               startTime:"5:00",
//               endTime: "6:00"
//           },
//           {
//               event: "B4",
//               background: "#c5e3e7", //grayish blue
//               startTime:"4:30",
//               endTime: "5:00"
//           }
//       ]
//   },
//   {
//       title: "C",
//       barbername: "Smith",
//       event: [
//           {
//               event: "C1",
//               background: "#FFA500",//orange
//               startTime:"5:00",
//               endTime: "6:00"
//           },
//           {
//               event: "C2",
//               background: "#FA86C4",//pink
//               startTime:"11:00",
//               endTime: "11:30"
//           }
//       ]
//   },
//   {
//       title: "D",
//       barbername: "Dorian",
//       event: [
//           {
//               event: "D1",
//               background: "#15F4EE", //flurocent blue
//               startTime:"4:30",
//               endTime: "5:00"
//           },
//           {
//               event: "D2",
//               background: "#FA86C4",//pink
//               startTime:"5:00",
//               endTime: "6:00"
//           },
//           {
//               event: "D3",
//               background: "#c5e3e7", //grayish blue
//               startTime:"2:00",
//               endTime: "2:30"
//           }
//       ]
//   },
//   {
//       title: "E",
//       barbername: "Mihawk",
//       event: [
//           {
//               event: "E1",
//               background: "#c5e3e7", //grayish blue
//               startTime:"8:00",
//               endTime: "9:00"
//           },
//           {
//               event: "E2",
//               background: "#15F4EE", //flurocent blue
//               startTime:"10:00",
//               endTime: "11:00"
//           },
//           {
//               event: "D3",
//               background: "#15F4EE", //flurocent blue
//               startTime:"2:00",
//               endTime: "2:30"
//           }
//       ]

//   },
//   {
//       title: "F",
//       barbername: "Georgina"

//   },
//   {
//       title: "G",
//       barbername: "Angelo"

//   },
//   {
//       title: "H",
//       barbername: "vinci"

//   }
// ]
