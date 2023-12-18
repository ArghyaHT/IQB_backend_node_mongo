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

//Get Engage BarberTimeSLots Api
const getEngageBarberTimeSlots = async (req, res) => {
  try {
    const { salonId, barberId, date } = req.body;

    // Convert date to ISO format (YYYY-MM-DD)
    const [day, month, year] = date.split('/');
    const isoFormattedDate = `${year}-${month}-${day}`;

    // Retrieve appointments for the specified salonId, barberId, and date
    const appointments = await Appointment.findOne({
      salonId: salonId,
      appointmentList: {
        $elemMatch: {
          barberId: barberId,
          appointmentDate: isoFormattedDate
        }
      }
    });

    console.log(appointments)

    let timeSlots = [];

    if (!appointments) {
      // If there are no appointments for the specified barber on the date, generate time slots as disabled: false
      const { appointmentSettings } = await SalonSettings.findOne({ salonId });
      const { appointmentStartTime, appointmentEndTime } = appointmentSettings;

      const start = moment(appointmentStartTime, 'HH:mm');
      const end = moment(appointmentEndTime, 'HH:mm');

      timeSlots = generateTimeSlots(start, end);
    } else {
      // If there are appointments for the specified barber on the date, generate time slots as disabled: true
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
          "appointmentList.appointmentDate": {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$appointmentList.appointmentDate"
            }
          },
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          appointmentList: {
            _id: 1,
            appointmentDate: 1,
            appointmentName: 1,
            startTime: 1,
            endTime: 1,
            timeSlots: 1,
            barberName: 1
          }
        }
      },
      { $sort: { "appointmentList.appointmentDate": 1 } }
    ]);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for the provided salon and barber IDs',
        appointments: [],
      });
    }

    const groupedAppointments = appointments.reduce((grouped, appointment) => {
      const date = appointment.appointmentList.appointmentDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment.appointmentList);
      return grouped;
    }, {});

    const result = Object.entries(groupedAppointments).map(([date, appointments]) => ({
      date,
      appointments,
    }));

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      appointments: result,
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

    // Convert appointmentDate to ISO format (YYYY-MM-DD)
    const [day, month, year] = appointmentDate.split('/');
    const isoFormattedDate = `${year}-${month}-${day}`;

    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(isoFormattedDate)
          },
          "appointmentList.barberId": barberId
        }
      },
      { $unwind: "$appointmentList" },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(isoFormattedDate)
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
          "appointmentList.appointmentDate": {
            $dateToString: {
              format: "%d/%m/%Y",
              date: "$appointmentList.appointmentDate"
            }
          },
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
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
        message: 'No appointments found for the provided salon ID, barber ID, and date',
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
    getAllAppointmentsBySalonIdAndDate,
    getAllAppointmentsByBarberIdAndDate
}


// [[date:16/12/23,{},{},{}], [date:17/12/23,{}]]