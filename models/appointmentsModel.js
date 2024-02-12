const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
salonId: {
    type: Number
},
appointmentList:[{
    barberId:{
        type: Number
    },
    services: [{
        serviceId: {
            type: Number
        },
        serviceName: {
            type: String
        },
        servicePrice:{
            type: Number
        },
        serviceEWT: {
            type: Number
        }
    }],
    appointmentNotes:{
        type: String
    },
    appointmentDate:{
        type: Date
    },
    startTime:{
        type: String
    },
    endTime:{
        type: String
    },
    timeSlots:{
        type: String
    },
    customerEmail:{
        type: String
    },
    customerName:{
        type: String
    },
    customerType:{
        type: String
    },
    methodUsed:{
        type: String
    }
}]
},{timestamps:true})

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;