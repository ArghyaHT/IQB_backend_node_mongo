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
const addAdvertisements = async (req, res) => {
    try {
      let advertisements = req.files.advertisements;
      let salonId = req.body.salonId;
  
      // Ensure that advertisements is an array, even for single uploads
      if (!Array.isArray(advertisements)) {
        advertisements = [advertisements];
      }
  
      const uploadPromises = advertisements.map(advertisement => {
        return new Promise((resolve, reject) => {
          const public_id = `${advertisement.name.split(".")[0]}`;
  
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
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message
      });
    }
};


//GetDashboardQList
const getDashboardAppointmentList = async (req, res) => {
  try {
    const { salonId, appointmentDate } = req.body;

    const appointments = await Appointment.aggregate([
      {
        $match: {
          salonId: salonId,
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
          }
        }
      },
      {
        $unwind: "$appointmentList"
      },
      {
        $match: {
          "appointmentList.appointmentDate": {
            $eq: new Date(appointmentDate)
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
          appointmentName: "$appointmentList.appointmentName",
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}; 
  
  module.exports = { addAdvertisements, getDashboardAppointmentList };