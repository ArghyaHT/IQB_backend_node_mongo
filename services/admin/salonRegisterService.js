const Salon = require("../../models/salonsRegisterModel.js")
const Admin = require("../../models/adminRegisterModel.js")
const Barber = require("../../models/barberRegisterModel.js")
const SalonSettings = require("../../models/salonSettingsModel.js")
const { validateEmail } = require("../../middlewares/validator.js")
const Country = require("../../models/countryModel.js")

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


    const salonId = await Salon.countDocuments() + 1;

    const firstTwoLetters = salonName.slice(0, 2).toUpperCase();
    console.log(firstTwoLetters)
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

      // Update: Convert 'country' to uppercase
      const titleCaseCountry = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();

      // Find the country data from the Country model
      const countryData = await Country.findOne({ name: titleCaseCountry });
  
      if (!countryData) {
        // Handle case where country is not found
        return {
          success: false,
          status: 201,
          response: 'Country not found',
        };
      }
  
      // Retrieve currency from countryData
      const currency = countryData.currency;

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
      currency,
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
        success: false,
        status: 201,
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
      success: true,
      status: 200,
      response: savedSalon,
    }

  }
  catch (error) {
    console.log(error.message)
    return {
      success: false,
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
        status: 201,
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
    salonName,
    salonLogo,
    salonId,
    adminEmail,
    address,
    salonType,
    contactTel,
    webLink,
    fblink,
    twitterLink,
    instraLink,
    services,
  } = salonData

  try {
    let updateFields = {
      salonName,
      salonLogo,
      salonId,
      adminEmail,
      address,
      salonType,
      contactTel,
      webLink,
      fblink,
      twitterLink,
      instraLink,
      services,
    }

    if (services && Array.isArray(services)) {
      // If services are provided, update the services
      const updatedServices = salon.services.map((existingService) => {
        const matchingService = services.find((s) => s.serviceId === existingService.serviceId);

        if (matchingService) {
          return {
            ...existingService.toObject(),
            serviceName: matchingService.serviceName,
            serviceIcon: {
              public_id: matchingService.serviceIcon.public_id,
              url: matchingService.serviceIcon.url,
            },
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
            serviceIcon: {
              public_id: newService.serviceIcon.public_id,
              url: newService.serviceIcon.url,
            },
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
  updateSalonBySalonId,
  getAllSalonServices,
  updateSalonService,
  deleteSalonService,
  getSalonsByAdminEmail
}

