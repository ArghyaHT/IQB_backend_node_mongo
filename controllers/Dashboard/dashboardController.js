const SalonSettings = require("../../models/salonSettingsModel");

const Appointment = require("../../models/appointmentsModel")

const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dfrw3aqyp',
  api_key: '574475359946326',
  api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});

//AddAdvertisements api
const addAdvertisements = async (req, res, next) => {
  try {
    let advertisements = req.files.advertisements;
    let salonId = req.body.salonId;

// Check if advertisements and salonId are missing
if (!advertisements || !salonId) {
  return res.status(400).json({
      success: false,
      message: "Advertisements and salonId are required"
  });
}
    // Ensure that advertisements is an array, even for single uploads
    if (!Array.isArray(advertisements)) {
      advertisements = [advertisements];
    }

    const uploadPromises = advertisements.map(advertisement => {
      return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const public_id = `${advertisement.name.split(".")[0]}_${timestamp}`;

        cloudinary.uploader.upload(advertisement.tempFilePath, {
          public_id: public_id,
          folder: "students", // Change the folder name as required
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
            fs.unlink(advertisement.tempFilePath, (unlinkError) => {
              if (unlinkError) {
                console.error('Failed to delete temporary file:', unlinkError);
              }
            });
          });
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Update the Salon model with the uploaded advertisement images
    const updatedSalon = await SalonSettings.findOneAndUpdate(
      { salonId },
      { $push: { advertisements: { $each: uploadedImages } } }, // Update the advertisements field with the uploaded images
      { new: true, projection: { _id: 0, advertisements: 1 } }
    );

    if (!updatedSalon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Advertisement images uploaded successfully",
      response: updatedSalon.advertisements,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//GetAdvertisements api
const getAdvertisements = async (req, res, next) => {
  try {
    const { salonId } = req.body;

    // Check if advertisements and salonId are missing
if (!salonId) {
  return res.status(400).json({
      success: false,
      message: "SalonId are required"
  });
}

    // Find SalonSettings by salonId and retrieve only the advertisements field
    const salonSettings = await SalonSettings.findOne({ salonId }).select('advertisements');

    // Sort advertisements array in descending order
    const sortedAdvertisements = salonSettings.advertisements.reverse();

    if (!salonSettings) {
      return res.status(404).json({ message: "Salon settings not found" });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement images retrieved successfully',
      advertisements: sortedAdvertisements
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Update Advertisements
const updateAdvertisements = async (req, res, next) => {
  try {
    const id = req.body.id;

    const updateadvertisements = await SalonSettings.findOne({ "advertisements._id": id }, { "advertisements.$": 1 })

    const public_imgid = req.body.public_imgid;
    const advertisements = req.files.advertisements;

    // Check if advertisements and salonId are missing
if (!advertisements) {
  return res.status(400).json({
      success: false,
      message: "Advertisements are required"
  });
}

    // Validate Image
    const fileSize = advertisements.size / 1000;
    const fileExt = advertisements.name.split(".")[1];

    if (fileSize > 500) {
      return res.status(400).json({ message: "File size must be lower than 500kb" });
    }

    if (!["jpg", "png", "jfif", "jpeg"].includes(fileExt)) {
      return res.status(400).json({ message: "File extension must be jpg or png" });
    }

    // Generate a unique public_id based on the original file name
    const public_id = `${advertisements.name.split(".")[0]}`;

    cloudinary.uploader.upload(advertisements.tempFilePath, {
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
        fs.unlink(advertisements.tempFilePath, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const updatedSalonSettings = await SalonSettings.findOneAndUpdate(
          { "advertisements._id": id },
          {
            $set: {
              'advertisements.$.public_id': image.public_id,
              'advertisements.$.url': image.url
            }
          },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: "Files Updated successfully",
          updatedSalonSettings
        });

      })
      .catch((error) => {
        console.log(error);
        next(error);
      })

  } catch (error) {
    console.log(error);
    next(error);
  }
}


//Delete Advertisements
const deleteAdvertisements = async (req, res, next) => {
  try {
    const public_id = req.body.public_id;
    const img_id = req.body.img_id;

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("Cloud image deleted");

      const updatedSalonSettings = await SalonSettings.findOneAndUpdate(
        { 'advertisements._id': img_id },
        { $pull: { advertisements: { _id: img_id } } },
        { new: true }
      );

      if (updatedSalonSettings) {
        return res.status(200).json({
          success: true,
          message: "Image successfully deleted"
        });
      } else {
        return res.status(404).json({ message: 'Image not found in the advertisements' });
      }
    } else {
      return res.status(500).json({ message: 'Failed to delete image.' });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};



//GetDashboardQList
const getDashboardAppointmentList = async (req, res, next) => {
  try {
    const { salonId, appointmentDate } = req.body;

    // Check if salonId and appointmentDate are missing
if (!salonId || !appointmentDate) {
  return res.status(400).json({
      success: false,
      message: "salonId and appointmentDate are required"
  });
}

  // Parse appointmentDate as a timestamp using Date.parse()
const timestamp = Date.parse(appointmentDate);

// Convert the timestamp to a date object
const date = new Date(timestamp);

// Convert to ISO format and extract the date part
const isoDate = date.toISOString().split('T')[0];

console.log(isoDate);

    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(isoDate)
          }
        }
      },
      {
        $unwind: "$appointmentList"
      },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(isoDate)
          }
        }
      },
      {
        $lookup: {
          from: "barbers",
          localField: "appointmentList.barberId",
          foreignField: "barberId",
          as: "barberInfo"
        }
      },
      {
        $addFields: {
          "appointmentList.barberName": {
            $arrayElemAt: ["$barberInfo.name", 0]
          },
          "appointmentList.background": "#FFFFFF", // Set your default color here
          "appointmentList.startTime": "$appointmentList.startTime",
          "appointmentList.endTime": "$appointmentList.endTime"
        }
      },
      {
        $project: {
          _id: 0, // Exclude MongoDB generated _id field
          barberId: "$appointmentList.barberId",
          serviceId: "$appointmentList.serviceId",
          appointmentNotes: "$appointmentList.appointmentNotes",
          appointmentServices: {
            $map: {
              input: "$appointmentList.services",
              as: "service",
              in: "$$service.serviceName"
            }
          },
          appointmentDate: {
            $dateToString: {
              format: "%Y-%m-%d", // Format the date as YYYY-MM-DD
              date: "$appointmentList.appointmentDate"
            }
          },

          startTime: "$appointmentList.startTime",
          endTime: "$appointmentList.endTime",
          timeSlots: {
            $concat: ["$appointmentList.startTime", "-", "$appointmentList.endTime"]
          },
          customerName: "$appointmentList.customerName",
          customerType: "$appointmentList.customerType",
          methodUsed: "$appointmentList.methodUsed",
          barberName: "$appointmentList.barberName",
          background: "$appointmentList.background"
        }
      },
      {
        $sort: {
          barberName: 1 // Sort by barberName in ascending order
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully for Dashboard',
      response: appointments
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  addAdvertisements,
  getDashboardAppointmentList,
  getAdvertisements,
  updateAdvertisements,
  deleteAdvertisements
};