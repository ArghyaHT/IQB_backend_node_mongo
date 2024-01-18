const Appointment = require("../../models/appointmentsModel");



const getAppointmentbyId = async(salonId)=>{
    const appointment = await Appointment.findOne({ salonId });
    return appointment;
 }


 
 const updateAppointmentById = async (salonId, appointmentId, barberId, serviceIds, appointmentDate, appointmentNotes, startTime, endTime) => {
   const updatedAppointment = await Appointment.findOneAndUpdate(
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

    // Return the updated appointment
    return updatedAppointment; 
}


 module.exports={
    getAppointmentbyId,
    updateAppointmentById
 }