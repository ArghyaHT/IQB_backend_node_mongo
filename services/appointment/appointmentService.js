const Appointment = require("../../models/appointmentsModel");



const getAppointmentbyId = async(salonId)=>{
    const appointment = await Appointment.findOne({ salonId });
    return appointment;
 }

 module.exports={
    getAppointmentbyId
 }