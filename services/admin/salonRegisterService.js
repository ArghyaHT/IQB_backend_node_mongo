const Salon = require("../../models/salonsRegisterModel.js")
const Admin = require("../../models/adminRegisterModel.js")

//-------CreateSalon------//

const createSalon = async (salonData) => {
  const {
    userName,
    salonName,
    adminEmail,
    salonIcon,
    salonLogo,
    address,
    city,
    location,
    country,
    postCode,
    contactTel,
    webLink,
    fblink,
    twitterLink,
    instraLink,
    services,
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
   
    await Admin.findOneAndUpdate(
      { email: adminEmail },
      { salonId: salonId },  // what if admin is having multiple salons.
      { new: true })

    const servicesData =  services.map((s, i) =>({
      serviceId: `${salonId}${i + 1}`,
      serviceCode:`${s.serviceName.slice(0, 2).toUpperCase()}${salonId}${i + 1}`,
      serviceName: s.serviceName,
      serviceDesc: s.serviceDesc,
      servicePrice: s.servicePrice

  }))

console.log(servicesData)

    //Save the Salon
    const salon = new Salon({
      salonId,
      userName,  // salonCode
      adminEmail,
      salonName,
      salonCode: salonCode,
      salonIcon,
      salonLogo,
      address,
      city,
      location,
      country,
      postCode,
      contactTel,
      webLink,
      fblink,
      twitterLink,
      instraLink,
      services:servicesData

    });

    const savedSalon = await salon.save();

    await savedSalon.save();



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

// const addSalonServices = async (serviceName, serviceDesc, servicePrice, salonId) => {

//   const name = serviceName;
//   const desc = serviceDesc;
//   const price = servicePrice
//   const searchSalonById = salonId;


//   try {

//       const salon = await Salon.findOne({ salonId: searchSalonById })

//       if (!salon) {
//           return ({
//               status: 404,
//               message: 'Salon not found'

//           });
//       }


//       const nextServiceId = `${searchSalonById}${salon.services.length + 1}`;
//       const firstTwoLetters = name.slice(0, 2).toUpperCase();

//       const serviceCode = firstTwoLetters + nextServiceId;

//       const newService = {
//           serviceId: nextServiceId,
//           serviceName: name,
//           serviceCode: serviceCode,
//           serviceDesc: desc,
//           servicePrice: price,
//       };

//       // Push the new service to the existing salon's Services array
//       salon.services.push(newService);

//       const savedSalonService = await salon.save();

//       return {
//           status: 200,
//           response: savedSalonService,
//       }
//   }

//   catch (error) {
//       console.log(error.message)
//       return {
//           status: 500,
//           message: error.message,
//       };
//   }
// }

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

const getSalonInfoBySalonId = async (salonId) => {
  try {
    const getSalonInfo = await Salon.findOne({ salonId })
    if (!getSalonInfo) {
      return ({
        status: 404,
        message: 'No salons found for the particular SalonId.',
      });
    }
    return ({
      status: 200,
      message: 'Salons found successfully.',
      response: getSalonInfo,
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

    const updateServices = services.map((s) =>{
     const serviceId = s.serviceId;
     const serviceName = s.serviceName;
     const servicePrice = s.servicePrice;

     const existingService = salon.services.find((service) => service.serviceId === serviceId);

        console.log(existingService)
        if (existingService) {
          existingService.serviceName = serviceName;
          existingService.servicePrice = servicePrice;
          return existingService;
        }
    });
   

    const updatedSalon = await Salon.findOne({ salonId: salonId, adminEmail: adminEmail },
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
        services: updateServices
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
    });
  }

}

const updateSalonService = async (salonId, serviceId, newServiceData) => {
  const {
    serviceName,
    serviceDescription
  } = newServiceData
  try {
    const updatedService = await Salon.findOneAndUpdate({ salonId, "SalonServices.ServiceId": serviceId },
      {
        $set: {
          "SalonServices.$.ServiceName": serviceName,
          "SalonServices.$.ServiceDescription": serviceDescription
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


module.exports = {
  createSalon,
  searchSalonsByCity,
  searchSalonsByLocation,
  getSalonInfoBySalonId,
  updateSalonBySalonId,
  getAllSalonServices,
  updateSalonService,
  deleteSalonService,
  // addSalonServices,
}

