const Salon = require("../../models/salonsRegisterModel.js")
const Admin = require("../../models/adminRegisterModel.js")

//-------CreateSalon------//

const createSalon = async (salonData, AdminEmail) => {
  const {
    UserName,
    SalonName,
    SalonAppIcon,
    SalonLogo,
    Address,
    City,
    Country,
    PostCode,
    ContactTel,
    SalonWebsite,
    SalonFacebook,
    SalonTwitter,
    SalonInstagram,
    SalonServices
  } = salonData

const email = AdminEmail
  try {

    const salonId = await Salon.countDocuments() + 1;

    const firstTwoLetters = SalonName.slice(0, 2).toUpperCase();
    // const secondTwoLetters = admin.FirstName.slice(0, 2).toUpperCase();


    const salonCode = firstTwoLetters + salonId;
    //Find the Salon If exits 
    const existingSalon = await Salon.findOne({ UserName: UserName });
    
    
    if (existingSalon) {
      return {
        status: 400,
        response: 'A Salon with the provided UserName already exists',
      };
    }


     await Admin.findOneAndUpdate(
      { Email: email },
      { SalonId: salonId },
      { new: true })

    //Save the Salon
    const salon = new Salon({
      SalonId: salonId,
      UserName: UserName,
      SalonName: SalonName,
      SalonCode: salonCode,
      SalonAppIcon: SalonAppIcon,
      SalonLogo: SalonLogo,
      Address: Address,
      City: City,
      Country: Country,
      PostCode: PostCode,
      ContactTel: ContactTel,
      SalonWebsite: SalonWebsite,
      SalonFacebook: SalonFacebook,
      SalonTwitter: SalonTwitter,
      SalonInstagram: SalonInstagram,
      SalonServices: SalonServices,
      AdminEmail: AdminEmail
    });

    const savedSalon = await salon.save();

    savedSalon.SalonServices.forEach((service, index) => {
      service.ServiceId = index + 1;
    });

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





const searchSalonsByCity = async (city) => {
  try {
    const salons = await Salon.find({ City: city })

    if (salons.length === 0) {
      return ({
        status: 404,
        message: 'No salons found for the specified city.',
      });
    }

    return ({
      status: 200,
      message: 'Salons found successfully.',
      data: salons,
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



const getSalonInfoBySalonId = async (salonId) => {
  try {
    const getSalonInfo = await Salon.findOne({ SalonId: salonId })
    if (!getSalonInfo) {
      return ({
        status: 404,
        message: 'No salons found for the particular SalonId.',
      });
    }
    return ({
      status: 200,
      message: 'Salons found successfully.',
      data: getSalonInfo,
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

const updateSalonBySalonId = async (salonData, salonId, adminEmail) => {
const {
  userName,
  salonName,
  salonAppIcon,
  salonLogo,
  address,
  city,
  country,
  postCode,
  contactTel,
  salonWebsite,
  salonFacebook,
  salonTwitter,
  salonInstagram,
  salonServices
} = salonData

try{
  if(!salonId || !adminEmail){
    return ({
      status: 201,
      message: 'Failed to search salons by The SalonId.',
    });
  }
  
  const updatedSalon = await Salon.findOneAndUpdate({SalonId: salonId, AdminEmail: adminEmail}, 
    { UserName: userName,
      SalonName: salonName,
      SalonAppIcon: salonAppIcon,
      SalonLogo: salonLogo,
      Address: address,
      City: city,
      Country: country,
      PostCode: postCode,
      ContactTel: contactTel,
      SalonWebsite: salonWebsite,
      SalonFacebook: salonFacebook,
      SalonInstagram: salonInstagram,
      SalonTwitter: salonTwitter,
      SalonServices: salonServices
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

const getAllSalonServices = async(salonId) =>{
  try{
    const salon = await Salon.findOne({SalonId: salonId})

    if(!salon){
       
      return ({
        status: 200,
        message: 'No Salons found',
      });
    }
    
    const allServices = salon.SalonServices

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

const updateSalonService = async(salonId, serviceId, newServiceData) => {
  const{
    serviceName,
    serviceDescription
  }= newServiceData
  try{
    const updatedService = await Salon.findOneAndUpdate({SalonId: salonId, "SalonServices.ServiceId": serviceId},
    {
      $set: {
        "SalonServices.$.ServiceName": serviceName,
        "SalonServices.$.ServiceDescription": serviceDescription
      }
    },
    {new: true})

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

const deleteSalonService = async(salonId, serviceId) =>{
  try{
    const updatedSalon = await Salon.findOneAndUpdate(
      { SalonId: salonId },
      {
        $pull: {
          SalonServices: { ServiceId: serviceId },
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
  getSalonInfoBySalonId,
  updateSalonBySalonId,
  getAllSalonServices,
  updateSalonService,
  deleteSalonService,
}

