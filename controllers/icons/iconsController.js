const Icons = require("../../models/iconsModel.js");

const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dfrw3aqyp',
  api_key: '574475359946326',
  api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});


//AddAdvertisements api
const addIcons = async (req, res, next) => {
    try {
      let icons = req.files.icons;
  
      // Ensure that icons is an array, even for single uploads
      if (!Array.isArray(icons)) {
        icons = [icons];
      }
  
      const uploadPromises = icons.map(icon => {
        return new Promise((resolve, reject) => {
          const timestamp = Date.now();
          const public_id = `${icon.name.split(".")[0]}_${timestamp}`;
  
          cloudinary.uploader.upload(icon.tempFilePath, {
            public_id: public_id,
            folder: "icons", // Change the folder name as required
          })
            .then((image) => {
              resolve({
                public_id: image.public_id,
                url: image.secure_url,
              });
            })
            .catch ((error) => {
              console.log(error);
              next(error);
            })
            .finally(() => {
              fs.unlink(icon.tempFilePath, (unlinkError) => {
                if (unlinkError) {
                  console.error('Failed to delete temporary file:', unlinkError);
                }
              });
            });
        });
      });
  
      const uploadedIcons = await Promise.all(uploadPromises);
  
      // Update the Icons model with the uploaded icon images
      const updatedIcons = await Icons.create({ icons: uploadedIcons });
  
      res.status(200).json({
        success: true,
        message: "Icon images uploaded successfully",
        response: updatedIcons.icons,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };



  const getAllIcons = async (req, res, next) => {
    try {
      // Fetch all icons from the database
      const allIcons = await Icons.findOne({}, { icons: 1 });
  
      if (!allIcons || !allIcons.icons || allIcons.icons.length === 0) {
        return res.status(201).json({
          success: false,
          message: "No icons found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "All icons retrieved successfully",
        response: allIcons.icons,
      });
    }catch (error) {
      console.log(error);
      next(error);
    }
  };


  module.exports = {
    addIcons,
    getAllIcons,
  }