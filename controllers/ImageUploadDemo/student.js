const path = require("path");
const fs = require('fs');
const Student = require("../../models/ImageUploadDemo/student");
const Salon = require("../../models/salonsRegisterModel");
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dfrw3aqyp',
    api_key: '574475359946326',
    api_secret: 'fGcEwjBTYj7rPrIxlSV5cubtZPc',
});

// Get all Students
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Get single Student
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(201).json({success: false, message: "Resource not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a Student
exports.createStudent = async (req, res, next) => {
  try {
    const students = await Student.create(req.body);
    res.status(200).json({ data: students });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Student
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) {
      return res.status(201).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ data: student });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Student
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    console.log(student);
    if (!student) {
      return res.status(201).json({ message: "Resource not found" });
    }
    res.status(200).json({ data: {} });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.uploadProfile = async (req, res, next) => {
  try {
    let profiles = req.files.profile;

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

        const StudentImage = await Salon.create({
          profile: profileimg
        });

        res.status(200).json({
          success: true,
          message: "Files Uploaded successfully",
          StudentImage
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
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const public_id = req.body.public_id
    const img_id = req.body.img_id

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      console.log("cloud img deleted")

    } else {
      res.status(500).json({ message: 'Failed to delete image.' });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { 'profile._id': img_id },
      { $pull: { profile: { _id: img_id } } },
      { new: true }
    );

    if (updatedStudent) {
      res.status(200).json({
        success: false,
        message: "Image successfully deleted"
      })
    } else {
      res.status(201).json({ message: 'Image not found in the student profile' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}


exports.updateProfile = async (req, res, next) => {
  try {
    const id = req.body.id;

    const studentProfile = await Student.findOne({ "profile._id": id }, { "profile.$": 1 })

    const public_imgid = req.body.public_imgid;
    const profile = req.files.profile;

    // Validate Image
    const fileSize = profile.size / 1000;
    const fileExt = profile.name.split(".")[1];

    if (fileSize > 500) {
      return res.status(400).json({ message: "File size must be lower than 500kb" });
    }

    if (!["jpg", "png", "jfif"].includes(fileExt)) {
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

        const updatedStudent = await Student.findOneAndUpdate(
          { "profile._id": id }, 
          { 
            $set: { 
              'profile.$.public_id': image.public_id,
              'profile.$.url': image.url
            } 
          }, 
          { new: true } 
        );

        res.json(updatedStudent)
        
      })



  } catch (error) {

  }
}