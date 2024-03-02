const salonService = require("../../services/admin/salonRegisterService")

const Salon = require("../../models/salonsRegisterModel")
const Barber = require("../../models/barberRegisterModel")

const path = require("path");
const fs = require('fs');
const { getAverageRating } = require("../Ratings/salonRatingController");
const { validateEmail } = require("../../middlewares/validator");
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dfrw3aqyp',
  api_key: '574475359946326',
  api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});

// Create a new Salon By Admin
const createSalonByAdmin = async (req, res, next) => {
  try {
    const {
      salonName,
      salonLogo,
      salonType,
      address,
      city,
      location,
      country,
      timeZone,
      postCode,
      contactTel,
      webLink,
      salonEmail,
      fbLink,
      twitterLink,
      instraLink,
      tiktokLink,
      services,
      appointmentSettings,
      adminEmail 
    } = req.body;
     
    // Check if required fields are missing
    if (!salonName || !salonEmail || !city || !country || !salonType || !contactTel || !services || !location || !appointmentSettings) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all the fields',
      });
    }

    //Find the Salon If exits 
    const existingSalon = await Salon.findOne({ $or: [{ salonEmail }, { salonName }] });
    if (existingSalon) {
      return res.status(400).json({
        success: false,
        message: "Salon with the Salon Email or Salon Name already exists"
      });
    }


    const email = salonEmail;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate the format and length of the contactTel
    if (!/^\d{10}$/.test(contactTel)) {
      return res.status(400).json({
        message: 'Invalid format for contactTel. It should be a 10-digit number',
      });
    }

    // Check if services array is empty
    if (!services || services.length === 0) {
      return res.status(400).json({
        message: 'Services is empty',
      });
    }
    const salonData = {
      adminEmail, 
      salonName,
      adminEmail,
      salonLogo,
      salonType,
      address,
      city,
      location,
      country,
      timeZone,
      postCode,
      contactTel,
      webLink,
      salonEmail,
      fbLink,
      twitterLink,
      instraLink,
      tiktokLink,
      services,
      appointmentSettings
    }
    const result = await salonService.createSalon(salonData);

    res.status(result.status).json({
      success: result.success,
      response: result.response,
      message: result.message,
      error: result.error
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
};

//Upload Salon Images
const uploadSalonGallery = async (req, res, next) => {
  try {
    let galleries = req.files.gallery;
    let salonId = req.body.salonId

    // Check if the required fields are present
    if (!req.files || !galleries || !salonId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both gallery files and salonId",
      });
    }

    // Ensure that galleries is an array, even for single uploads
    if (!Array.isArray(galleries)) {
      galleries = [galleries];
    }

    const uploadPromises = [];

    for (const gallery of galleries) {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          const public_id = `${gallery.name.split(".")[0]}`;

          cloudinary.uploader.upload(gallery.tempFilePath, {
            public_id: public_id,
            folder: "students",
          })
            .then((image) => {
              resolve({
                public_id: image.public_id,
                url: image.secure_url, // Store the URL
              });
            })
            .catch((error) => {
              console.log(error);
              next(error);
            })
            .finally(() => {
              // Delete the temporary file after uploading
              fs.unlink(gallery.tempFilePath, (unlinkError) => {
                if (unlinkError) {
                  console.error('Failed to delete temporary file:', unlinkError);
                }
              });
            });
        })
      );
    }

    Promise.all(uploadPromises)
      .then(async (galleryimg) => {
        console.log(galleryimg);

        const salon = await Salon.findOneAndUpdate(
          { salonId }, { gallery: galleryimg }, { new: true });

        res.status(200).json({
          success: true,
          message: "Files Uploaded successfully",
          salon
        });
      })
      .catch((error) => {
        console.log(error);
        next(error);
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

const uploadMoreSalonGalleryImages = async (req, res, next) => {
  try {
    let galleries = req.files.gallery;
    let salonId = req.body.salonId;

    // Check if the required fields are present
    if (!req.files || !galleries || !salonId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both gallery files and salonId",
      });
    }
    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    // Ensure that profiles is an array, even for single uploads
    if (!Array.isArray(galleries)) {
      galleries = [galleries];
    }

    const uploadPromises = galleries.map(gallery => {
      return new Promise((resolve, reject) => {
        const public_id = `${gallery.name.split(".")[0]}`;

        cloudinary.uploader.upload(gallery.tempFilePath, {
          public_id: public_id,
          folder: "students",
        })
          .then((image) => {
            resolve({
              public_id: image.public_id,
              url: image.secure_url,
            });
          })
          .catch((error) => {
            console.log(error);
            next(error);
          })
          .finally(() => {
            fs.unlink(gallery.tempFilePath, (unlinkError) => {
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
      { $push: { gallery: { $each: uploadedImages } } },
      { new: true }
    );

    if (!updatedSalon) {
      return res.status(201).json({success: false,  message: "Salon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Files Uploaded successfully",
      salon: updatedSalon,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Update Salon  Images
const updateSalonImages = async (req, res, next) => {
  try {

    // Check if the required fields are present
    if (!req.files.gallery) {
      return res.status(400).json({ success: false, message: "Please provide gallery files" });
    }
    const id = req.body.id;

    const salonProfile = await Salon.findOne({ "gallery._id": id }, { "gallery.$": 1 })

    const public_imgid = req.body.public_imgid;
    const gallery = req.files.gallery;

    // Validate Image
    const fileSize = gallery.size / 1000;
    const fileExt = gallery.name.split(".")[1];

    if (fileSize > 500) {
      return res.status(400).json({ message: "File size must be lower than 500kb" });
    }

    if (!["jpg", "png", "jfif", "svg"].includes(fileExt)) {
      return res.status(400).json({ message: "File extension must be jpg or png" });
    }

    // Generate a unique public_id based on the original file name
    const public_id = `${gallery.name.split(".")[0]}`;

    cloudinary.uploader.upload(gallery.tempFilePath, {
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
        fs.unlink(gallery.tempFilePath, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const updatedSalon = await Salon.findOneAndUpdate(
          { "gallery._id": id },
          {
            $set: {
              'gallery.$.public_id': image.public_id,
              'gallery.$.url': image.url
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
    console.log(error);
    next(error);
  }
}

//Delete Salon Images
const deleteSalonImages = async (req, res, next) => {
  try {
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ success: false, message: 'Failed to delete image.' });
    }

    const updatedSalon = await Salon.findOneAndUpdate(
      { 'gallery._id': img_id },
      { $pull: { gallery: { _id: img_id } } },
      { new: true }
    );

    if (updatedSalon) {
      res.status(200).json({
        success: true,
        message: "Image successfully deleted"
      })
    } else {
      res.status(201).json({ success: false, message: 'Image not found in the student profile' });
    }

  } catch (error) {
    console.log(error);
    next(error);
  }
}

const getSalonImages = async (req, res, next) => {
  try {
    const { salonId } = req.body;

    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    // Find SalonSettings by salonId and retrieve only the advertisements field
    const salongallery = await Salon.findOne({ salonId }).select('gallery');

    if (!salongallery) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    // Sort advertisements array in descending order
    const sortedSalonGallery = salongallery.gallery.reverse();

    res.status(200).json({
      success: true,
      message: 'Salon images retrieved successfully',
      response: sortedSalonGallery
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

const uploadSalonLogo = async (req, res, next) => {
  try {
    const salonLogo = req.files.salonLogo;
    const salonId = req.body.salonId;

    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    // Check if the required fields are present
    if (!salonLogo) {
      return res.status(400).json({
        success: false,
        message: "Please provide both gallery files and salonId",
      });
    }

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
          .catch((error) => {
            console.log(error);
            next(error);
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
    console.log(error);
    next(error);
  }
};

const updateSalonLogo = async (req, res, next) => {
  try {
    const id = req.body.id;
    const salonId = req.body.salonId;
    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    const salonLogoInfo = await Salon.findOne({ "salonLogo._id": id }, { "salonLogo.$": 1 });

    const public_imgid = req.body.public_imgid;
    const salonLogo = req.files.salonLogo;

    // Check if the required fields are present
    if (!salonLogo) {
      return res.status(400).json({
        success: false,
        message: "Please provide both gallery files and salonId",
      });
    }

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
    console.log(error);
    next(error);
  }
};

const getSalonLogo = async (req, res, next) => {
  try {
    const salonId = req.body.salonId; // Assuming you pass salonId as a route parameter

    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    // Find the salon in the database
    const salon = await Salon.findOne({ salonId }).select("salonLogo");

    if (!salon || !salon.salonLogo) {
      return res.status(201).json({ success: false, message: 'Salon or logo not found.' });
    }

    // Send the salon logo information in the response
    res.status(200).json({
      success: true,
      message: "Salon logo retrieved",
      response: salon
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteSalonLogo = async (req, res, next) => {
  try {
    const salonId = req.body.salonId;
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ success: false, message: 'Failed to delete image.' });
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
      res.status(201).json({ success: false, message: 'Image not found in the student profile' });
    }

  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addServices = async (req, res, next) => {
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
    console.log(error);
    next(error);
  }
}

//SEARCH SALONS BY LOCATION
const getSalonsByLocation = async (req, res, next) => {

  try {
    const { longitude, latitude } = req.query;
    let salons = [];
    salons = await Salon.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          key: "location",
          // maxDistance: parseFloat(1000) * 1609,
          maxDistance: Number.MAX_VALUE,
          spherical: true,
          distanceField: "dist.calculated",
        },
      },
    ]);

     // Populate salonRatings field
     await Salon.populate(salons, { path: "salonRatings" });

    return res.status(200).json({
      status: 200,
      success: true,
      response: salons
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
  // try {
  //   const salons = await Salon.find({}); // Retrieve all salons from the database
  //   res.status(200).json({
  //     success: true,
  //     response: salons
  //   });
  // } catch (error) {
  //   console.log(error);
  //   next(error);
  // }
}

//GET SALON INFO
const getSalonInfo = async (req, res, next) => {
  const { salonId } = req.query;
  try {
    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    // Find salon information by salonId
    const salonInfo = await Salon.findOne({ salonId }).populate("salonRatings");

    if (!salonInfo) {
      res.status(201).json({
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
    console.log(error);
    next(error);
  }
}

//Update Salon By Admin
const updateSalonBySalonIdAndAdminEmail = async (req, res, next) => {
  const {
    salonName,
    salonLogo,
    salonId,
    adminEmail,
    address,
    salonType,
    contactTel,
    webLink,
    fbLink,
    twitterLink,
    instraLink,
    tiktokLink,
    services,
  } = req.body;

  // Check if required fields are missing or empty
  if (!salonId || !services) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }



  // Validate email format for adminEmail
  if (!validateEmail(adminEmail)) {
    return res.status(400).json({ success: false, message: "Invalid admin email format" });
  }
  const salon = await Salon.findOne({ salonId, adminEmail })
  if (!salon) {
    return res.status(400).json({ success: false, message: "Salon Not found" });
  }
  // Validate contactTel format (assuming it should be exactly 10 digits)
  if (contactTel && !/^\d{10}$/.test(contactTel)) {
    return res.status(400).json({ success: false, message: "Invalid format for contact. It should be a 10-digit number" });
  }

  const salonData = {
    salonName,
    salonLogo,
    salonId,
    adminEmail,
    address,
    salonType,
    contactTel,
    webLink,
    fbLink,
    twitterLink,
    instraLink,
    tiktokLink,
    services,
  }

  try {
    const result = req.body != null ? await salonService.updateSalonBySalonId(salonData) : null;

    res.status(result.status).json({
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

//Update Salon Image and DeleteSalon Image

const allSalonServices = async (req, res, next) => {
  const { salonId } = req.query;
  try {
    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    const result = await salonService.getAllSalonServices(salonId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

const updateSalonServiceByServiceId = async (req, res, next) => {
  const { salonId, serviceId } = req.body
  // Check if salonId is provided in the request body
  if (!salonId) {
    return res.status(400).json({ success: false, message: "Please provide salonId" });
  }
  // Check if salonId exists in the database
  const salonExists = await Salon.exists({ salonId: salonId });

  if (!salonExists) {
    return res.status(201).json({ success: false, message: "Salon not found" });
  }
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
    console.log(error);
    next(error);
  }
}

const deleteServiceByServiceIdSalonId = async (req, res, next) => {
  const { salonId, serviceId } = req.body;
  try {
    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    const result = await salonService.deleteSalonService(salonId, serviceId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


//GET ALL SALONS BY ADMIN EMAIL
const getAllSalonsByAdmin = async (req, res, next) => {

  try {
    const { adminEmail } = req.query;
    const email = adminEmail;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    const result = await salonService.getSalonsByAdminEmail(adminEmail)

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response,
      error: result.error
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


//SEARCH SALONS BY NAME AND CITY
const searchSalonsByNameAndCity = async (req, res, next) => {
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
    console.log(error);
    next(error);
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
const deleteSalon = async (req, res, next) => {
  try {
    const { salonId } = req.body;

    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    const deletedSalon = await Salon.findOneAndUpdate({ salonId }, { isDeleted: true }, { new: true });

    if (!deletedSalon) {
      res.status(201).json({
        success: false,
        message: "The Salon with the SalonId not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "The Salon has been deleted",
      response: deletedSalon
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

//Get All Salons

const getAllSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find({}); // Retrieve all salons from the database
    res.status(200).json({
      success: true,
      response: salons
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}


//Change Salon Online Status
const changeSalonOnlineStatus = async (req, res, next) => {

  try {
    const { salonId, isOnline } = req.body;

    // Check if salonId is provided in the request body
    if (!salonId) {
      return res.status(400).json({ success: false, message: "Please provide salonId" });
    }
    // Check if salonId exists in the database
    const salonExists = await Salon.exists({ salonId: salonId });

    if (!salonExists) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }

    const updatedSalon = await Salon.findOneAndUpdate(
      { salonId: salonId },
      { isOnline: isOnline }, // Update the Salon isOnline field in the database
      { new: true }
    );

    if (!updatedSalon) {
      return res.status(201).json({ success: false, message: "Salon not found" });
    }
    // res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).json(updatedSalon);
  } catch (error) {
    console.log(error);
    next(error);
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
  uploadSalonGallery,
  getSalonImages,
  updateSalonImages,
  deleteSalonImages,
  uploadMoreSalonGalleryImages,
  getAllSalons,
  changeSalonOnlineStatus,
  uploadSalonLogo,
  updateSalonLogo,
  getSalonLogo,
  deleteSalonLogo,
}