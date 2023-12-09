const salonService = require("../../services/admin/salonRegisterService")

const Salon = require("../../models/salonsRegisterModel")
const Barber = require("../../models/barberRegisterModel")

const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dfrw3aqyp',
    api_key: '574475359946326',
    api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});

// Create a new Salon By Admin
const createSalonByAdmin = async (req, res) => {
  try {
    const salonData = req.body;
    const { adminEmail } = req.body


    const result = await salonService.createSalon(salonData, adminEmail);

    res.status(result.status).json({
      success: true,
      response: result.response,
      message: result.message,
      error: result.error
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Salon'
    });
  }
};

//Upload Salon Images
const uploadProfile = async(req, res) =>{
  try {
    let profiles = req.files.profile;
    let salonId = req.body.salonId

    // Ensure that profiles is an array, even for single uploads
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const uploadPromises = [];

    for (const profile of profiles) {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          const public_id = `${profile.name.split(".")[0]}`;

          cloudinary.uploader.upload(profile.tempFilePath, {
            public_id: public_id,
            folder: "students",
          })
            .then((image) => {
              resolve({
                public_id: image.public_id,
                url: image.secure_url, // Store the URL
              });
            })
            .catch((err) => {
              reject(err);
            })
            .finally(() => {
              // Delete the temporary file after uploading
              fs.unlink(profile.tempFilePath, (unlinkError) => {
                if (unlinkError) {
                  console.error('Failed to delete temporary file:', unlinkError);
                }
              });
            });
        })
      );
    }

    Promise.all(uploadPromises)
      .then(async (profileimg) => {
        console.log(profileimg);

        const salon = await Salon.findOneAndUpdate(
          {salonId},{ profile: profileimg }, {new: true});

        res.status(200).json({
          success: true,
          message: "Files Uploaded successfully",
          salon
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Cloudinary upload failed" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const addServices = async (req, res) => {
  try {
    const { serviceName, serviceDesc, servicePrice } = req.body;
    const { salonId } = req.body;

    const result = await salonService.addSalonServices(serviceName, serviceDesc, servicePrice, salonId);
    res.status(result.status).json({
      response: result.response,
      error: result.error
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create Salon'
    });
  }
}

// const searchSalonsByCity = async (req, res) => {

//   try {
//     const { city } = req.body
//     const result = await salonService.searchSalonsByCity(city)

//     res.status(result.status).json({
//       success: true,
//       response: result.response,
//       message: result.message,

//     })
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to search Salons'
//     });
//   }
// }

const getSalonsByLocation = async (req, res) => {

  try {
    const { longitude, latitude } = req.query;
    const result = await salonService.searchSalonsByLocation(longitude, latitude)

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response

    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to search Salons'
    });
  }
}


const getSalonInfo = async (req, res) => {
  const { salonId } = req.query;
  try {
    // Find salon information by salonId
    const salonInfo = await Salon.findOne({ salonId });

    if (!salonInfo) {
      res.status(404).json({
        success: false,
        message: 'No salons found for the particular SalonId.',
      });
    }

    // Find associated barbers using salonId
    const barbers = await Barber.find({ salonId });
    console.log(barbers)

    res.status(200).json({
      success: true,
      message: 'Salon and barbers found successfully.',
      response: {
        salonInfo: salonInfo,
        barbers: barbers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to search salons and barbers by the SalonId.',
    });
  }
}

//Update Salon By Admin
const updateSalonBySalonIdAndAdminEmail = async (req, res) => {

  try {
    const result = req.body != null ? await salonService.updateSalonBySalonId(req.body) : null;

    res.status(result.status).json({
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to Update Salon',
      error: error.message
    });
  }
}

//Update Salon Image and DeleteSalon Image

const allSalonServices = async (req, res) => {
  const { salonId } = req.query;
  try {
    const result = await salonService.getAllSalonServices(salonId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to get services'
    });
  }
}

const updateSalonServiceByServiceId = async (req, res) => {
  const { salonId, serviceId } = req.body
  const newServiceData = req.body;
  try {
    const result = await salonService.updateSalonService(salonId, serviceId, newServiceData);
    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to update services'
    });
  }
}

const deleteServiceByServiceIdSalonId = async (req, res) => {
  const { salonId, serviceId } = req.body;
  try {
    const result = await salonService.deleteSalonService(salonId, serviceId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to update services'
    });
  }
}



const getAllSalonsByAdmin = async (req, res) => {

  try {
    const { adminEmail } = req.query;
    const result = await salonService.getSalonsByAdminEmail(adminEmail)

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response,
      error: result.error
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to search Salons'
    });
  }
}


const searchSalonsByNameAndCity = async(req, res) =>{
  try{
    const {salonName, city, limit = 3, sortField, sortOrder} = req.query;
    let query = {};
    const searchRegExpName = new RegExp('.*' + salonName + ".*", 'i')
    const searchRegExpEmail = new RegExp('.*' + city + ".*", 'i')
    
    if (salonName || city) {
      query.$or = [
        { salonName: { $regex: searchRegExpName } },
        { city: { $regex: searchRegExpEmail } }
      ];
    }

    const sortOptions = {};
    if (sortField && sortOrder) {
      sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    const getAllSalons = await Salon.find(query).sort(sortOptions).limit(Number(limit));
    res.status(200).json({
      success: true,
      message: "All Salons fetched successfully",
      getAllSalons,
    })
  }catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: error.message,
    };
  }
}

const deleteSalon = async(req, res) =>{
  try{
    const {salonId} = req.body;

    const deletedSalon = await Salon.findOneAndUpdate({salonId}, {isDeleted: true}, {new: true});

    if(!deletedSalon){
      res.status(404).json({
        success: true,
        message: "The Salonw ith the SalonId not found",
       })
      }

      res.status(200).json({
        success: true,
        message: "The Salon has been deleted",
        response: deletedSalon
      })
     }
     catch (error) {
      console.log(error.message)
      return {
        status: 500,
        message: error.message,
      };
    }
}
module.exports = {
  createSalonByAdmin,
  // searchSalonsByCity,
  getSalonsByLocation,
  getSalonInfo,
  updateSalonBySalonIdAndAdminEmail,
  allSalonServices,
  updateSalonServiceByServiceId,
  deleteServiceByServiceIdSalonId,
  addServices,
  getAllSalonsByAdmin,
  searchSalonsByNameAndCity,
  deleteSalon,
  uploadProfile,
}