const BarberService = require("../../models/barberServiceModel");
const Service = require("../../models/servicesModel")

const addBarberServices = async (salonId, barberId, selectedServices) => {

    try {
        const matchServices = await Service.find({ "services.serviceId": { $in: selectedServices } })

        const barberServiceDocs = matchServices.map(service => {
            // Find the specific service within the services array
            const selectedService = service.services.find(s => selectedServices.includes(s.serviceId));
      
            // Create a new barberService document
            const addedService = {
              salonId: salonId,
              barberId: barberId,
              barberServices: [
                {
                  serviceId: selectedService.serviceId,
                  serviceCode: selectedService.serviceCode,
                  serviceName: selectedService.serviceName,
                }
              ]
            };
            
            return addedService; // Return the created document
          });
      
       // Insert the barberService documents into the BarberService collection
    const insertedDocs = await BarberService.insertMany(barberServiceDocs);

    console.log("Inserted barberService documents:", insertedDocs);

    return { 
        status: 200, response: "Barber services added successfully" };
    }
    catch (error) {
        console.log(error.message)
        return {
          status: 500,
          error: 'Failed to create customer'
        };
      }
}

module.exports = {
    addBarberServices
}