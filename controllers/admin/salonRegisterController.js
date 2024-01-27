const salonService = require("../../services/admin/salonRegisterService")

const Salon = require("../../models/salonsRegisterModel")
const Barber = require("../../models/barberRegisterModel")

const path = require("path");
const fs = require('fs');
const { getAverageRating } = require("../Ratings/salonRatingController");
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
const uploadProfile = async (req, res) => {
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
          { salonId }, { profile: profileimg }, { new: true });

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

const uploadMoreProfileImages = async (req, res) => {
  try {
    let profiles = req.files.profile;
    let salonId = req.body.salonId;

    // Ensure that profiles is an array, even for single uploads
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const uploadPromises = profiles.map(profile => {
      return new Promise((resolve, reject) => {
        const public_id = `${profile.name.split(".")[0]}`;

        cloudinary.uploader.upload(profile.tempFilePath, {
          public_id: public_id,
          folder: "students",
        })
          .then((image) => {
            resolve({
              public_id: image.public_id,
              url: image.secure_url,
            });
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            fs.unlink(profile.tempFilePath, (unlinkError) => {
              if (unlinkError) {
                console.error('Failed to delete temporary file:', unlinkError);
              }
            });
          });
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId },
      { $push: { profile: { $each: uploadedImages } } },
      { new: true }
    );

    if (!updatedSalon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Files Uploaded successfully",
      salon: updatedSalon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

//Update Salon  Images
const updateSalonImages = async (req, res) => {
  try {
    const id = req.body.id;

    const salonProfile = await Salon.findOne({ "profile._id": id }, { "profile.$": 1 })

    const public_imgid = req.body.public_imgid;
    const profile = req.files.profile;

    // Validate Image
    const fileSize = profile.size / 1000;
    const fileExt = profile.name.split(".")[1];

    if (fileSize > 500) {
      return res.status(400).json({ message: "File size must be lower than 500kb" });
    }

    if (!["jpg", "png", "jfif", "svg"].includes(fileExt)) {
      return res.status(400).json({ message: "File extension must be jpg or png" });
    }

    // Generate a unique public_id based on the original file name
    const public_id = `${profile.name.split(".")[0]}`;

    cloudinary.uploader.upload(profile.tempFilePath, {
      public_id: public_id,
      folder: "students",
    })
      .then(async (image) => {

        const result = await cloudinary.uploader.destroy(public_imgid);

        if (result.result === 'ok') {
          console.log("cloud img deleted")

        } else {
          res.status(500).json({ message: 'Failed to delete image.' });
        }

        // Delete the temporary file after uploading to Cloudinary
        fs.unlink(profile.tempFilePath, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const updatedSalon = await Salon.findOneAndUpdate(
          { "profile._id": id },
          {
            $set: {
              'profile.$.public_id': image.public_id,
              'profile.$.url': image.url
            }
          },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "Files Updated successfully",
          updatedSalon
        });

      })



  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
}

//Delete Salon Images
const deleteSalonImages = async (req, res) => {
  try {
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ message: 'Failed to delete image.' });
    }

    const updatedSalon = await Salon.findOneAndUpdate(
      { 'profile._id': img_id },
      { $pull: { profile: { _id: img_id } } },
      { new: true }
    );

    if (updatedSalon) {
      res.status(200).json({
        success: true,
        message: "Image successfully deleted"
      })
    } else {
      res.status(404).json({ message: 'Image not found in the student profile' });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

const uploadSalonLogo = async (req, res) => {
  try {
    const salonLogo = req.files.salonLogo;
    const salonId = req.body.salonId;

    // Ensure that salonLogo is an array, even for single uploads
    const salonLogos = Array.isArray(salonLogo) ? salonLogo : [salonLogo];

    const uploadPromises = salonLogos.map((logo) => {
      return new Promise((resolve, reject) => {
        const public_id = `${logo.name.split(".")[0]}`;

        cloudinary.uploader.upload(logo.tempFilePath, {
          public_id: public_id,
          folder: "salons",
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
            fs.unlink(logo.tempFilePath, (unlinkError) => {
              if (unlinkError) {
                console.error('Failed to delete temporary file:', unlinkError);
              }
            });
          });
      });
    });

    const salonLogosUploaded = await Promise.all(uploadPromises);

    const salon = await Salon.findOneAndUpdate(
      { salonId }, { salonLogo: salonLogosUploaded }, { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Salon Logo Uploaded successfully",
      salon
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateSalonLogo = async (req, res) => {
  try {
    const id = req.body.id;
    const salonId = req.body.salonId;

    const salonLogoInfo = await Salon.findOne({ "salonLogo._id": id }, { "salonLogo.$": 1 });

    const public_imgid = req.body.public_imgid;
    const salonLogo = req.files.salonLogo;

    // Validate Image
    const fileSize = salonLogo.size / 1000;
    const fileExt = salonLogo.name.split(".")[1];

    if (fileSize > 1000) {
      return res.status(400).json({ message: "File size must be lower than 1000kb" });
    }

    if (!["jpg", "png", "jfif", "svg"].includes(fileExt)) {
      return res.status(400).json({ message: "File extension must be jpg or png" });
    }

    // Generate a unique public_id based on the original file name
    const public_id = `${salonLogo.name.split(".")[0]}`;

    const image = await cloudinary.uploader.upload(salonLogo.tempFilePath, {
      public_id: public_id,
      folder: "salons",
    });

    const result = await cloudinary.uploader.destroy(public_imgid);

    if (result.result === 'ok') {
      console.log("Cloud image deleted");
    } else {
      return res.status(500).json({ message: 'Failed to delete image.' });
    }

    // Delete the temporary file after uploading to Cloudinary
    fs.unlink(salonLogo.tempFilePath, (err) => {
      if (err) {
        console.error(err);
      }
    });

    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId, "salonLogo._id": id },
      {
        $set: {
          'salonLogo.$.public_id': image.public_id,
          'salonLogo.$.url': image.secure_url
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "File Updated successfully",
      updatedSalon
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getSalonLogo = async (req, res) => {
  try {
    const salonId = req.body.salonId; // Assuming you pass salonId as a route parameter

    // Find the salon in the database
    const salon = await Salon.findOne({ salonId }).select("salonLogo");

    if (!salon || !salon.salonLogo) {
      return res.status(404).json({ success: false, message: 'Salon or logo not found.' });
    }

    // Send the salon logo information in the response
    res.status(200).json({
      success: true,
     message: "Salon logo retrieved",
     response: salon
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteSalonLogo = async (req, res) => {
  try {
    const salonId = req.body.salonId;
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ message: 'Failed to delete image.' });
    }

    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId, 'salonLogo._id': img_id },
      { $pull: { salonLogo: { _id: img_id } } },
      { new: true }
    );

    if (updatedSalon) {
      res.status(200).json({
        success: true,
        message: "Image successfully deleted"
      })
    } else {
      res.status(404).json({ message: 'Image not found in the student profile' });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

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

//SEARCH SALONS BY LOCATION
const getSalonsByLocation = async (req, res) => {

  // try {
  //   const { longitude, latitude } = req.query;
  //   const result = await salonService.searchSalonsByLocation(longitude, latitude)

  //   res.status(result.status).json({
  //     success: true,
  //     message: result.message,
  //     response: result.response

  //   })
  // }
  // catch (error) {
  //   console.error(error);
  //   res.status(500).json({
  //     error: 'Failed to search Salons'
  //   });
  // }
  try {
    const salons = await Salon.find({}); // Retrieve all salons from the database
    res.status(200).json({
      success: true,
      response: salons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      response: 'Server Error',
      error: error.message
    });
  }
}

//GET SALON INFO
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

    const salonRating = await getAverageRating(salonId)

    res.status(200).json({
      success: true,
      message: 'Salon and barbers found successfully.',
      response: {
        salonInfo: salonInfo,
        barbers: barbers,
        salonRating: salonRating
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


//GET ALL SALONS BY ADMIN EMAIL
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


//SEARCH SALONS BY NAME AND CITY
const searchSalonsByNameAndCity = async (req, res) => {
  try {
    const { searchValue, limit = 10, sortField, sortOrder } = req.query;

    let query = {};

    //Creating the RegExp For salonName and City
    const searchRegExpName = new RegExp('.*' + searchValue + ".*", 'i')
    const searchRegExpCity = new RegExp('.*' + searchValue + ".*", 'i')

    //Query for searching salonName and City
    if (searchValue) {
      query.$or = [
        { salonName: { $regex: searchRegExpName } },
        { city: { $regex: searchRegExpCity } }
      ];
    }

    const sortOptions = {};

    //Creating sorting options
    if (sortField && sortOrder) {
      sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    const getAllSalons = await Salon.find(query).sort(sortOptions).limit(Number(limit));
    res.status(200).json({
      success: true,
      response: getAllSalons,
    })
  } catch (error) {
    console.log(error.message)
    return {
      status: 500,
      message: error.message,
    };
  }
  // try {
  //   const salons = await Salon.find({}); // Retrieve all salons from the database
  //   res.status(200).json({
  //     success: true,
  //     response: salons
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     response: 'Server Error',
  //     error: error.message
  //   });
  // }
}

//Delete Salon
const deleteSalon = async (req, res) => {
  try {
    const { salonId } = req.body;

    const deletedSalon = await Salon.findOneAndUpdate({ salonId }, { isDeleted: true }, { new: true });

    if (!deletedSalon) {
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

//Get All Salons

const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find({}); // Retrieve all salons from the database
    res.status(200).json({
      success: true,
      response: salons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      response: 'Server Error',
      error: error.message
    });
  }
}


//Change Salon Online Status
const changeSalonOnlineStatus = async (req, res) => {

  try {
    const { salonId, isOnline } = req.body;

    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId: salonId },
      { isOnline: isOnline }, // Update the Salon isOnline field in the database
      { new: true }
    );

    if (!updatedSalon) {
      return res.status(404).json({ message: "Barber not found" });
    }
    // res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).json(updatedSalon);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
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
  updateSalonImages,
  deleteSalonImages,
  uploadMoreProfileImages,
  getAllSalons,
  changeSalonOnlineStatus,
  uploadSalonLogo,
  updateSalonLogo,
  getSalonLogo,
  deleteSalonLogo
}