const Salon = require("../../models/salonsRegisterModel.js")
const Admin = require("../../models/adminRegisterModel.js")
const Barber = require("../../models/barberRegisterModel.js")
const SalonSettings = require("../../models/salonSettingsModel.js")

//-------CreateSalon------//

const createSalon = async (salonData) => {
  const {
    userName,
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
    fblink,
    twitterLink,
    instraLink,
    services,
    appointmentSettings
  } = salonData

  try {

     //Find the Salon If exits 
    const existingSalon = await Salon.findOne({ userName });


    if (existingSalon) {
      return {
        status: 400,
        response: 'A Salon with the provided UserName already exists',
      };
    }

    const salonId = await Salon.countDocuments() + 1;

    const firstTwoLetters = salonName.slice(0, 2).toUpperCase();
    // const secondTwoLetters = admin.FirstName.slice(0, 2).toUpperCase();

    const salonCode = firstTwoLetters + salonId;
   
    const servicesData =  services.map((s, i) =>({
      serviceId: `${salonId}${i + 1}`,
      serviceCode:`${s.serviceName.slice(0, 2).toUpperCase()}${salonId}${i + 1}`,
      serviceName: s.serviceName,
      serviceDesc: s.serviceDesc,
      servicePrice: s.servicePrice,
      serviceEWT: s.serviceEWT

  }))

    //Save the Salon
    const salon = new Salon({
      salonId,
      userName,  // salonCode
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
      fblink,
      salonEmail,
      twitterLink,
      instraLink,
      services:servicesData

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

   const { startTime, endTime } = appointmentSettings;

   // Create a new SalonSettings instance with generated time slots
   const newSalonSettings = new SalonSettings({
       salonId,
       appointmentSettings: {
           appointmentStartTime: startTime,
           appointmentEndTime: endTime,
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
            key:"location",
            maxDistance: parseFloat(1000)*1609,
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

    const salon = await Salon.findOne({salonId, adminEmail })

    if (!salon) {
      return {
        status: 404,
        message: 'Salon not found.',
      };
    }
    
    if (!salon.services || !Array.isArray(salon.services)) {
      return {
        status: 500,
        message: 'Salon services are missing or not an array.',
      };
    }

    // const updateServices = services.map((s) =>{
    //  const serviceId = s.serviceId;
    //  const serviceName = s.serviceName;
    //  const servicePrice = s.servicePrice;

    //  const existingService = salon.services.find((service) => service.serviceId === serviceId);

    //     console.log(existingService)
    //     if (existingService) {
    //       existingService.serviceName = serviceName;
    //       existingService.servicePrice = servicePrice;
    //       return existingService;
    //     }
    // });
   

    const updatedSalon = await Salon.findOneAndUpdate({ salonId: salonId, adminEmail: adminEmail },
      {
        userName,
        salonName,
        salonIcon,
        salonLogo,
        address,
        city,
        country,
        postCode,
        contactTel,
        webLink,
        fblink,
        twitterLink,
        instraLink,
        services,
        salonEmail
      },
      {
        new: true
      })

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
const getSalonsByAdminEmail = async(adminEmail) =>{

  try{
    const salonListByAdminEmail = await Salon.find({adminEmail, isDeleted: false});

    if(!salonListByAdminEmail){
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

