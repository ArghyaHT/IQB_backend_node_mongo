const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const moment = require("moment")

const createAppointment = async(req, res) => {
    try{
        const {salonId, barberId, serviceId, appointmentDate, startTime, customerName, customerType, methodUsed} = req.body;

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
            totalServiceEWT += service.serviceEWT || 0;
      
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

     // Parse formattedTime into hours and minutes
    const [formattedHours, formattedMinutes] = formattedTime.split(':').map(Number);

    // Parse startTime from the request body into hours and minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);

   // Calculate endTime by adding formattedTime to startTime using Moment.js
   const startTimeMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
   const formattedTimeMoment = moment().startOf('day').add(formattedHours, 'hours').add(formattedMinutes, 'minutes');
   const endTimeMoment = startTimeMoment.clone().add(formattedTimeMoment.hours(), 'hours').add(formattedTimeMoment.minutes(), 'minutes');
   const endTime = endTimeMoment.format('HH:mm');
    
        const exitingAppointmentList = await Appointment.findOne({salonId});
        const newAppointment = {
            barberId,
            serviceId: serviceIds, 
            appointmentDate, 
            startTime,
            timeSlots: `${startTime}-${endTime}`, 
            customerName, 
            customerType,
            methodUsed,
        }
        if(exitingAppointmentList){
            exitingAppointmentList.appointmentList.push(newAppointment);
            await exitingAppointmentList.save();
            res.status(200).json({
                success: true,
                message: "Appointment Confirmed",
                response: exitingAppointmentList,
              });
        }else{
            const newAppointmentData = new Appointment({
                salonId: salonId,
                appointmentList: [newAppointment]
            })
            const savedAppointment = await newAppointmentData.save();
            res.status(200).json({
                success: true,
                message: "Appointment Confirmed",
                response: savedAppointment,
              })
        }

    }catch(error){
        console.log(error);
        res.status(500).json({
          success: false,
          error: 'Your appointment is not done. Please Try Again',
        });
    }
}
const getAllAppointmentsByBarberId = async(req, res) =>{
try{
    const {salonId,barberId} = req.body;

    const appointments = await Appointment.aggregate([
        {
          $match: {
            salonId: salonId
          }
        },
        {
          $project: {
            appointments: {
              $filter: {
                input: "$appointmentList",
                as: "appt",
                cond: { $eq: ["$$appt.barberId", barberId] }
              }
            }
          }
        }
      ]);
   
    res.status(200).json({
        success: true,
        message: "Appointment List Retrieved",
        response: appointments,
      })
}
catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Couldnot retrive the appointments of the barber',
    });
}
}

const getEngageBarberTimeSlots = async (req, res) => {
    try {
      const { salonId, date, barberId } = req.body;
  
    //   const appointments = await Appointment.aggregate([
    //     {
    //       $match: {
    //         salonId: salonId,
    //       }
    //     },
    //     {
    //       $unwind: "$appointmentList"
    //     },
    //     {
    //       $match: {
    //         "appointmentList.barberId": barberId,
    //         "appointmentList.appointmentDate": { $eq: new Date(date) }
    //       }
    //     },
    //     {
    //       $group: {
    //         _id: null,
    //         timeSlots: { $push: "$appointmentList.timeSlots" }
    //       }
    //     }
    //   ]);
    //   const timeSlots = appointments.length > 0 ? appointments[0].timeSlots : [];
    const appointments = await Appointment.find({
        salonId: salonId,
        "appointmentList.barberId": barberId,
        "appointmentList.appointmentDate": new Date(date)
      });
  
      let timeSlots = [];
      appointments.forEach(appointment => {
        const barberAppointments = appointment.appointmentList.filter(appt => appt.barberId === barberId && appt.appointmentDate.toDateString() === new Date(date).toDateString());
        const slots = barberAppointments.map(appt => appt.timeSlots);
        timeSlots = timeSlots.concat(slots);
      });
      res.status(200).json({
        success: true,
        message: "Time Slots Retrieved",
        response: timeSlots,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: 'Could not retrieve the time slots for the engaged barber',
      });
    }
  };
module.exports = {
    createAppointment,
    getAllAppointmentsByBarberId,
    getEngageBarberTimeSlots
}