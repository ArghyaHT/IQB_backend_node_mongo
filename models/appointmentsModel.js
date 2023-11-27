const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
salonId: {
    type: Number
},
appointmentList:[{
    barberId:{
        type: Number
    },
    serviceId:{
        type: String
    },
    appointmentDate:{
        type: Date
    },
    startTime:{
        type: String
    },
    timeSlots:{
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