const Appointment = require("../../models/appointmentsModel")
const Barber = require("../../models/barberRegisterModel")
const SalonSettings = require("../../models/salonSettingsModel")
const moment = require("moment")


//Creating Appointment
const createAppointment = async(req, res) => {
    try{
        const {salonId, barberId, serviceId, appointmentDate, startTime, customerEmail, customerName, customerType, methodUsed} = req.body;

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
            customerEmail,
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
module.exports = {
    createAppointment,
    getAllAppointmentsByBarberId,
    getEngageBarberTimeSlots
}