const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const SalonSettings = require("../../models/salonSettingsModel")
const Admin = require("../../models/adminRegisterModel")
const moment = require("moment");
const { sendAppointmentsEmail } = require("../../utils/emailSender");
const { getBarberbyId } = require("../../services/barber/barberRegisterService");
const { getAppointmentbyId } = require("../../services/appointment/appointmentService");
const AppointmentHistory = require("../../models/appointmentHistoryModel");
const { validateEmail } = require("../../middlewares/validator");


//Creating Appointment
const createAppointment = async (req, res, next) => {
  try {
    const { salonId, barberId, serviceId, appointmentDate, appointmentNotes, startTime, customerEmail, customerName, customerType, methodUsed } = req.body;

    // Check if required fields are missing
    if (!salonId || !barberId || !serviceId || !appointmentDate || !startTime || !customerName) {
      return res.status(400).json({
        message: 'Please fill all the fields',
      });
    }

    const email = customerEmail;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Fetch barber information
    const barber = await getBarberbyId(barberId);

    // Calculate total barberServiceEWT for all provided serviceIds
    let totalServiceEWT = 0;
    let serviceIds = [];
    let serviceNames = [];
    let servicePrices = [];
    let barberServiceEWTs = [];
    if (barber && barber.barberServices) {
      // Convert single serviceId to an array if it's not already an array
      const services = Array.isArray(serviceId) ? serviceId : [serviceId];

      services.forEach(id => {
        const service = barber.barberServices.find(service => service.serviceId === id);
        if (service) {
          totalServiceEWT += service.barberServiceEWT || 0;
          serviceIds.push(service.serviceId);
          serviceNames.push(service.serviceName);
          servicePrices.push(service.servicePrice);
          barberServiceEWTs.push(service.barberServiceEWT);
        }
      });
    }

    // Calculate totalServiceEWT in hours and minutes
    const hours = Math.floor(totalServiceEWT / 60);
    const minutes = totalServiceEWT % 60;

    // const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    // Parse startTime from the request body into hours and minutes
    // const [startHours, startMinutes] = startTime.split(':').map(Number);

    // Calculate endTime by adding formattedTime to startTime using Moment.js
    const startTimeMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endTimeMoment = startTimeMoment.clone().add(hours, 'hours').add(minutes, 'minutes');
    const endTime = endTimeMoment.format('HH:mm');

    const existingAppointmentList = await getAppointmentbyId(salonId);// make this call in appointmentService
    console.log(existingAppointmentList, "appointment list")
    const newAppointment = {
      barberId,
      services: serviceIds.map((id, index) => ({
        serviceId: id,
        serviceName: serviceNames[index],
        servicePrice: servicePrices[index],
        barberServiceEWT: barberServiceEWTs[index],
      })),
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

      const adminEmail = await Admin.findOne({ salonId }).select("email")

      // Prepare email data for admin, barber, and customer
      const adminEmailData = {
        email: adminEmail, // Replace with the admin's email address
        subject: 'New Appointment Created',
        html: `
        <h2>Hello Admin!</h2>
        <p>A new appointment has been created at ${startTime} by ${customerName}.</p>
        <!-- Add more details here -->
      `,
      };

      const barberEmailData = {
        email: barber.email, // Replace with the barber's email address
        subject: 'New Appointment Created',
        html: `
        <h2>Hello ${barber.name}!</h2>
        <p>You have a new appointment scheduled at ${startTime}.</p>
        <!-- Add more details here -->
      `,
      };

      const customerEmailData = {
        email: customerEmail, // Replace with the customer's email address
        subject: 'Appointment Confirmation',
        html: `
        <h2>Hello ${customerName}!</h2>
        <p>Your appointment has been confirmed at ${startTime}.</p>
        <!-- Add more details here -->
      `,
      };

      // Combine email data objects into an array
      const emailDataArray = [adminEmailData, barberEmailData, customerEmailData];

      // Send emails to admin, barber, and customer
      sendAppointmentsEmail(emailDataArray);
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
      const adminEmail = await Admin.findOne({ salonId }).select("email")


      // Prepare email data for admin, barber, and customer
      const adminEmailData = {
        email: adminEmail, // Replace with the admin's email address
        subject: 'New Appointment Created',
        html: `
              <h2>Hello Admin!</h2>
              <p>A new appointment has been created at ${startTime} by ${customerName}.</p>
              <!-- Add more details here -->
            `,
      };

      const barberEmailData = {
        email: barber.email, // Replace with the barber's email address
        subject: 'New Appointment Created',
        html: `
        <h2>Hello ${barber.name}!</h2>
              <p>You have a new appointment scheduled at ${startTime}.</p>
              <!-- Add more details here -->
            `,
      };

      const customerEmailData = {
        email: customerEmail, // Replace with the customer's email address
        subject: 'Appointment Confirmation',
        html: `
        <h2>Hello ${customerName}!</h2>
              <p>Your appointment has been confirmed at ${startTime}.</p>
              <!-- Add more details here -->
            `,
      };
      // Combine email data objects into an array
      const emailDataArray = [adminEmailData, barberEmailData, customerEmailData];

      // Send emails to admin, barber, and customer
      sendAppointmentsEmail(emailDataArray);

    }

  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Edit Appointments By Admin and Barber
const editAppointment = async (req, res, next) => {
  try {
    const { appointmentId, salonId, barberId, serviceId, appointmentDate, appointmentNotes, startTime } = req.body; // Assuming appointmentId is passed as a parameter

    // Check if required fields are missing
    if (!salonId || !barberId || !serviceId || !appointmentDate || !startTime) {
      return res.status(400).json({
        message: 'Please fill all the fields',
      });
    }

    // Assuming salonId, barberId, serviceId are numeric, you can check their type
    if (typeof salonId !== 'number' || typeof barberId !== 'number' || typeof serviceId !== 'number') {
      return res.status(400).json({
        message: 'Invalid format for salonId, barberId, or serviceId',
      });
    }
    // Fetch barber information
    const barber = await Barber.findOne({ barberId: barberId });
    // Calculate total barberServiceEWTs for all provided serviceIds
    let totalServiceEWT = 0;
    let serviceIds = [];
    let serviceNames = [];
    let servicePrices = [];
    let barberServiceEWTs = [];
    if (barber && barber.barberServices) {
      // Convert single serviceId to an array if it's not already an array
      const services = Array.isArray(serviceId) ? serviceId : [serviceId];

      services.forEach(id => {
        const service = barber.barberServices.find(service => service.serviceId === id);
        if (service) {
          totalServiceEWT += service.barberServiceEWT || 0;
          serviceIds.push(service.serviceId);
          serviceNames.push(service.serviceName);
          servicePrices.push(service.servicePrice);
          barberServiceEWTs.push(service.barberServiceEWT);
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
          'appointmentList.$.services': serviceIds.map((id, index) => ({
            serviceId: id,
            serviceName: serviceNames[index],
            servicePrice: servicePrices[index],
            barberServiceEWT: barberServiceEWTs[index],
          })),
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
    console.log(error);
    next(error);
  }
};

//Delete Appointment
const deleteAppointment = async (req, res, next) => {
  try {
    const { salonId, appointmentId } = req.body; // Assuming appointmentId is passed as a parameter
    // Check if required fields are missing
    if (!salonId || !appointmentId) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

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
    console.log(error);
    next(error);
  }
};

//Get Engage BarberTimeSLots Api
const getEngageBarberTimeSlots = async (req, res, next) => {
  try {
    const { salonId, barberId, date } = req.body;

    // Check if required fields are missing
    if (!salonId || !barberId || !date) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }


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
      const { appointmentStartTime, appointmentEndTime, intervalInMinutes } = appointmentSettings;

      //Generate the timeslots for the barber If no appointments
      const start = moment(appointmentStartTime, 'HH:mm');
      const end = moment(appointmentEndTime, 'HH:mm');

      console.log('Interval in minutes:', intervalInMinutes);

      timeSlots = generateTimeSlots(start, end, intervalInMinutes);
    } else {
      const appointmentList = appointments.map(appt => appt.appointmentList);

      // Generate time slots for the barber If have appointments
      const { appointmentSettings } = await SalonSettings.findOne({ salonId });
      const { appointmentStartTime, appointmentEndTime, intervalInMinutes } = appointmentSettings;

      const start = moment(appointmentStartTime, 'HH:mm');
      const end = moment(appointmentEndTime, 'HH:mm');

      timeSlots = generateTimeSlots(start, end, intervalInMinutes);

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
    console.log(error);
    next(error);
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
const getAllAppointmentsBySalonId = async (req, res, next) => {
  try {
    const { salonId } = req.body;

    // Check if required fields are missing
    if (!salonId) {
      return res.status(400).json({
        message: 'Missing salonId',
      });
    }


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
          "appointmentList.appointmentNotes": 1,
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
    next(error);
  }
};

//Get All Appointments By SalonId and Date
const getAllAppointmentsBySalonIdAndDate = async (req, res, next) => {
  try {
    const { salonId, appointmentDate } = req.body;

    // Check if required fields are missing
    if (!salonId || !appointmentDate) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }


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
    console.log(error);
    next(error);
  }
};

// Get all appointments by salonid and barberid
const getAllAppointmentsByBarberId = async (req, res, next) => {
  try {
    const { salonId, barberId } = req.body;

    // Check if required fields are missing
    if (!salonId || !barberId) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }


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
          "appointmentList.appointmentNotes": 1,
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
    next(error);
  }
};

//Get All Appointments By SalonId and Date
const getAllAppointmentsByBarberIdAndDate = async (req, res, next) => {
  try {
    const { salonId, barberId, appointmentDate } = req.body;

    // Check if required fields are missing
    if (!salonId || !barberId || !appointmentDate) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }


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
          appointments: {
            $push: {
              appointmentDate: "$appointmentList.appointmentDate",
              barberId: "$appointmentList.barberId",
              appointmentNotes: "$appointmentList.appointmentNotes",
              services: {
                $map: {
                  input: "$appointmentList.services",
                  as: "service",
                  in: {
                    serviceId: "$$service.serviceId",
                    serviceName: "$$service.serviceName"
                  }
                }
              },
              appointmentStartTime: "$appointmentList.startTime",
              appointmentEndTime: "$appointmentList.endTime",
              customerName: "$appointmentList.customerName",
              methodUsed: "$appointmentList.methodUsed"
            }
          }
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
    next(error);
  }
};

//Served Appointment
const barberServedAppointment = async (req, res, next) => {
  try {
    const { salonId, barberId, _id, appointmentDate } = req.body;
    // Check if required fields are missing
    if (!salonId || !barberId || !_id || !appointmentDate) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    // Find the appointment to be served
    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId,
        }
      },
      {
        $unwind: '$appointmentList'
      },
      {
        $match: {
          'appointmentList._id': _id,
          'appointmentList.barberId': barberId,
          'appointmentList.appointmentDate': new Date(appointmentDate),
        }
      }
    ]);

    // Check if appointment exists
    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Extract the served appointment from the list
    const appointment = appointments[0]; // Take the first appointment in the list

    console.log(appointment)
    // Extract the served appointment from the list
    const servedAppointmentIndex = appointment.appointmentList.findIndex(appt => appt._id.toString() === _id && appt.barberId === barberId && appt.appointmentDate.toISOString() === appointmentDate);


    // Check if served appointment exists
    if (servedAppointmentIndex === -1) {
      // Create a new served appointment entry
      const newServedAppointment = {
        barberId: appointment.appointmentList[0].barberId,
        appointmentNotes: appointment.appointmentList[0].appointmentNotes,
        appointmentDate: appointmentDate,
        startTime: appointment.appointmentList[0].startTime,
        endTime: appointment.appointmentList[0].endTime,
        timeSlots: appointment.appointmentList[0].timeSlots,
        customerEmail: appointment.appointmentList[0].customerEmail,
        customerName: appointment.appointmentList[0].customerName,
        customerType: appointment.appointmentList[0].customerType,
        methodUsed: appointment.appointmentList[0].methodUsed,
        status: 'served',
        services: []
      };

      // Map services of the first appointment in the list to newServedAppointment
      appointment.appointmentList[0].services.forEach(service => {
        newServedAppointment.services.push({
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          servicePrice: service.servicePrice,
          barberServiceEWT: service.barberServiceEWT
        });
      });
      // Check the retrieved appointment
      // console.log(appointment.appointmentList[0]); // Check the first appointment in the list
      // console.log(appointment.appointmentList[0].services); 
      // // Store the served appointment in AppointmentHistory collection
      // const historyEntry = await AppointmentHistory.findOneAndUpdate(
      //   { salonId },
      //   {
      //     $push: {
      //       appointmentList: newServedAppointment, // Store the served appointment details
      //     },
      //   },
      //   { upsert: true, new: true }
      // );
    }

    // Remove the served appointment from the Appointment table
    // await Appointment.updateOne(
    //   { salonId },
    //   {
    //     $pull: {
    //       'appointmentList': {
    //         _id: _id,
    //         barberId: barberId,
    //         appointmentDate: appointmentDate,
    //         'services.serviceId': { $in: serviceId },
    //       },
    //     },
    //   }
    // );

    res.status(200).json({
      success: true,
      message: 'Appointment served successfully.',
    });
  } catch (error) {
    console.log(error);
    next(error);
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
  barberServedAppointment

}

