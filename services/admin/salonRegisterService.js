const Salon = require("../../models/salonsRegisterModel.js")
const Admin = require("../../models/adminRegisterModel.js")
const Barber = require("../../models/barberRegisterModel.js")
const SalonSettings = require("../../models/salonSettingsModel.js")

//-------CreateSalon------//

const createSalon = async (salonData) => {
  const {
    salonName,
    adminEmail,
    salonIcon,
    salonLogo,
    salonType,
    address,
    city,
    location,
    country,
    postCode,
    contactTel,
    webLink,
    salonEmail,
    fbLink,
    twitterLink,
    instraLink,
    services,
    appointmentSettings
  } = salonData

  try {

    //Find the Salon If exits 
    const existingSalon = await Salon.findOne({ salonName });


    if (existingSalon) {
      return {
        status: 400,
        response: 'A Salon with the provided Name already exists',
      };
    }

    const salonId = await Salon.countDocuments() + 1;

    const firstTwoLetters = salonName.slice(0, 2).toUpperCase();
    // const secondTwoLetters = admin.FirstName.slice(0, 2).toUpperCase();

    const salonCode = firstTwoLetters + salonId;

    const servicesData = services.map((s, i) => ({
      serviceId: `${salonId}${i + 1}`,
      serviceCode: `${s.serviceName.slice(0, 2).toUpperCase()}${salonId}${i + 1}`,
      serviceName: s.serviceName,
      serviceIcon: {
        public_id: s.serviceIcon.public_id,
        url: s.serviceIcon.url,
      },
      serviceDesc: s.serviceDesc,
      servicePrice: s.servicePrice,
      serviceEWT: s.serviceEWT

    }))

    //Save the Salon
    const salon = new Salon({
      salonId,
      adminEmail,
      salonName,
      salonCode: salonCode,
      salonIcon,
      salonLogo,
      salonType,
      address,
      city,
      location,
      country,
      postCode,
      contactTel,
      webLink,
      fbLink,
      salonEmail,
      twitterLink,
      instraLink,
      services: servicesData

    });

    const savedSalon = await salon.save();

    const admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      admin.registeredSalons.push(savedSalon.salonId); // Assuming salonId is the unique identifier for salons
      admin.salonId = savedSalon.salonId; // Update the salonId of the admin
      await admin.save();
    } else {
      // Handle the case where admin is not found
      return {
        status: 404,
        response: 'Admin not found',
      };
    }

    const { startTime, endTime, intervalInMinutes } = appointmentSettings;

    // Create a new SalonSettings instance with generated time slots
    const newSalonSettings = new SalonSettings({
      salonId,
      appointmentSettings: {
        appointmentStartTime: startTime,
        appointmentEndTime: endTime,
        intervalInMinutes: intervalInMinutes
      }
    });

    // Save the new SalonSettings to the database
    await newSalonSettings.save();

    return {
      status: 200,
      response: savedSalon,
    }

  }
  catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: error.message,
    };

  }
}

//Search Salons By City
const searchSalonsByCity = async (city) => {
  try {
    const salons = await Salon.find({ city })

    if (!salons.length) {

      return ({
        status: 404,
        message: 'No salons found for the specified city.',
      });
    }

    return ({
      status: 200,
      message: 'Salons found successfully.',
      response: salons,
    });

  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to search salons by city.',
    });
  }
}


//Search Salons By Location
const searchSalonsByLocation = async (longitude, latitude) => {
  let salons = [];

  try {
    salons = await Salon.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          key: "location",
          maxDistance: parseFloat(1000) * 1609,
          spherical: true,
          distanceField: "dist.calculated",
        },
      },
    ]);
    return {
      status: 200,
      success: true,
      response: salons
    };
  }
  catch (error) {
    // Handle the error within the function or log it
    console.error('Error finding salons:', error);
    return {
      status: 404,
      success: false,
      message: 'Error finding salons.'
    };
  }


  // return {
  //   status:500,
  //   success: false,
  //   message: 'No salons found within the specified distance.'
  // };
};

//Get All Salon Services
const getAllSalonServices = async (salonId) => {
  try {
    const salon = await Salon.findOne({ salonId })

    if (!salon) {

      return ({
        status: 200,
        message: 'No Salons found',
      });
    }

    const allServices = salon.services

    return ({
      status: 200,
      message: 'Services found successfully.',
      response: allServices,
    });
  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to search salons by The SalonId.',
    });
  }
}


//Update Salon By SalonId
const updateSalonBySalonId = async (salonData) => {
  const {
    userName,
    salonName,
    salonIcon,
    salonLogo,
    salonId,
    adminEmail,
    address,
    salonType,
    city,
    country,
    postCode,
    contactTel,
    webLink,
    fblink,
    salonEmail,
    twitterLink,
    instraLink,
    services,
  } = salonData

  try {
    if (!salonId || !adminEmail) {
      return ({
        status: 201,
        message: 'Failed to search salons by The SalonId.',
      });
    }

    const salon = await Salon.findOne({ salonId, adminEmail })

    if (!salon) {
      return {
        status: 404,
        message: 'Salon not found.',
      };
    }

    let updateFields = {
      userName,
      salonName,
      salonIcon,
      salonLogo,
      salonId,
      salonType,
      adminEmail,
      address,
      city,
      country,
      postCode,
      contactTel,
      webLink,
      fblink,
      salonEmail,
      twitterLink,
      instraLink,
    }

    if (services && Array.isArray(services)) {
      // If services are provided, update the services
      const updatedServices = salon.services.map((existingService) => {
        const matchingService = services.find((s) => s.serviceId === existingService.serviceId);
    
        if (matchingService) {
          return {
            ...existingService.toObject(),
            serviceName: matchingService.serviceName,
            servicePrice: matchingService.servicePrice,
            serviceDesc: matchingService.serviceDesc,
            serviceEWT: matchingService.serviceEWT,
          };
        }
        return existingService; // Keep the existing service unchanged
      });
    
      const existingServiceCount = updatedServices.length;
    
      // Calculate the next available serviceCounter based on existing services count
      let serviceCounter = existingServiceCount + 1;
    
      // Check for any new services that don't exist in the current services array
      services.forEach((newService) => {
        const existingService = updatedServices.find((s) => s.serviceId === newService.serviceId);
        if (!existingService) {
          // If the service doesn't exist, add it to the updatedServices array
          updatedServices.push({
            serviceId: `${salonId}${serviceCounter}`,
            serviceCode: `${newService.serviceName.slice(0, 2).toUpperCase()}${salonId}${serviceCounter}`,
            serviceName: newService.serviceName,
            servicePrice: newService.servicePrice,
            serviceDesc: newService.serviceDesc,
            serviceEWT: newService.serviceEWT,
            // Add any other necessary properties here
          });
          serviceCounter++; // Increment serviceCounter for the next service
        }
      });
    
      updateFields.services = updatedServices;
    }



    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId: salonId, adminEmail: adminEmail },
      {
        // Update only the provided fields
        $set: updateFields,
      },
      {
        new: true,
      }
    );

    return ({
      status: 200,
      message: 'Salons found successfully.',
      response: updatedSalon,
    });
  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to search salons by The SalonId.',
      error: error.message
    });
  }

}


//Update Salon Service
const updateSalonService = async (salonId, serviceId, newServiceData) => {
  const {
    serviceName,
    serviceDesc,
    servicePrice,
  } = newServiceData
  try {
    const updatedService = await Salon.findOneAndUpdate({ salonId, "services.serviceId": serviceId },
      {
        $set: {
          "services.$.serviceName": serviceName,
          "services.$.serviceDesc": serviceDesc,
          "services.$.servicePrice": servicePrice
        }
      },
      { new: true })

    return ({
      status: 200,
      message: 'Service updated successfully.',
      response: updatedService,
    });
  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to update services by The SalonId.',
    });
  }
}

//Delete Salon Service
const deleteSalonService = async (salonId, serviceId) => {
  try {
    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId },
      {
        $pull: {
          services: { serviceId: serviceId },
        },
      },
      { new: true }
    );

    return ({
      status: 200,
      message: 'Service deleted successfully.',
      response: updatedSalon,
    });
  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to delete Service',
    });
  }
}

//Get Salons By Admin Email
const getSalonsByAdminEmail = async (adminEmail) => {

  try {
    const salonListByAdminEmail = await Salon.find({ adminEmail, isDeleted: false });

    if (!salonListByAdminEmail) {
      return ({
        status: 200,
        message: 'No Salons found for this Admin',
      });
    }

    return ({
      status: 200,
      message: 'Salons found successfully.',
      response: salonListByAdminEmail,
    });
  }
  catch (error) {
    console.error(error);
    return ({
      status: 500,
      message: 'Failed to search salons by this adminEmail.',
    });
  }

}


module.exports = {
  createSalon,
  searchSalonsByCity,
  searchSalonsByLocation,
  updateSalonBySalonId,
  getAllSalonServices,
  updateSalonService,
  deleteSalonService,
  getSalonsByAdminEmail
}

