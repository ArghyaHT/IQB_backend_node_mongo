const BarberService = require("../../models/barberServiceModel");
const Service = require("../../models/servicesModel")
const Barber = require("../../models/barberRegisterModel")

const addBarberServices = async (salonId, barberId, selectedServicesArray) => {
  try {
    // Fetch the barber details from the 'Barber' model
    const barber = await Barber.findOne({ barberId: barberId });

    if (!barber) {
      return {
        status: 404,
        error: 'Barber not found',
      };
    }

    const barberEmail = barber.email; // Retrieve the barberEmail
    // You can retrieve other barber details as needed

    const matchServices = await Service.find({ "services.serviceId": { $in: selectedServicesArray } });

    const barberServiceDocs = matchServices.map(service => {
      const selectedServiceIds = service.services
        .filter(s => selectedServicesArray.includes(s.serviceId))
        .map(s => ({
          serviceId: s.serviceId,
          serviceCode: s.serviceCode,
          serviceName: s.serviceName,
        }));

      // Include selected services and supported barbers in the document
      return {
        salonId: salonId,
        barberId: barberId,
        barberServices: selectedServiceIds,
        supportedBarbers: [
          {
            barberId: barberId,
            barberEmail: barberEmail,
          },
        ],
      };
    });

    // Insert the barberService documents into the BarberService collection
    const insertedDocs = await BarberService.insertMany(barberServiceDocs);

    console.log("Inserted barberService documents:", insertedDocs);

    // Update the 'Service' model to add 'barberId' and 'barberEmail' for each service
    for (const serviceId of selectedServicesArray) {
      await Service.findOneAndUpdate(
        { "services.serviceId": serviceId },
        {
          $push: {
            "services.$.supportedBarbers": {
              barberId: barberId,
              barberEmail: barberEmail,
            },
          },
        },
        { new: true }
      );
    }

    console.log("Barber added to services");

    return { 
      status: 200,
      response: "Barber services and supported Barbers added successfully"
    };
  } catch (error) {
    console.log(error.message);
    return {
      status: 500,
      error: 'Failed to create customer'
    };
  }
};




const getServicesByBarberId = async (barberId) => {
  try {
  
    const barberServicesDoc = await BarberService.findOne({ barberId: barberId });

  
    if (barberServicesDoc) {
      const barberServices = barberServicesDoc.barberServices;
      return {
        status: 200,
        response: barberServices,
      };
    } else {
      return {
        status: 404,
        response: 'Barber services not found for the given barberId',
      };
    }
  } catch (error) {
    console.log(error.message);
    return {
      status: 500,
      error: 'Failed to get barber services',
    };
  }
};


const deleteBarberServices = async (salonId, barberId, selectedServicesArray) => {
  try {
    salonId = Number(salonId);
    barberId = Number(barberId);

    const barber = await Barber.findOne({ barberId: barberId });

    if (!barber) {
      return {
        status: 404,
        error: 'Barber not found',
      };
    }
    const barberEmail = barber.email;

    
    const filter = {
      salonId: salonId,
      barberId: barberId,
      'barberServices.serviceId': { $in: selectedServicesArray },
    };

    const deletedDocs = await BarberService.deleteMany(filter);

    console.log("Deleted barberService documents:", deletedDocs);

    for (const serviceId of selectedServicesArray) {
      await Service.findOneAndUpdate(
        { "services.serviceId": serviceId },
        {
          $pull: {
            "services.$.supportedBarbers": {
              barberId: barberId,
              barberEmail: barberEmail,
            },
          },
        },
        { new: true }
      );
    }

    console.log("Barber removed from services");

    return {
      success: true,
      status: 200,
      response: "Barber services deleted successfully",
    };
  } catch (error) {
    console.log(error.message);
    return {
      status: 500,
      error: 'Failed to delete barber services',
    };
  }
};





module.exports = {
    addBarberServices,
    getServicesByBarberId,
    deleteBarberServices
}