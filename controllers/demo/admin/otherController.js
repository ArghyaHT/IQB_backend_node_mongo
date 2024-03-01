const mongoose = require('mongoose');
const Salon = require("../../models/Admin/Salon")
const User = require("../../models/Admin/User")

const adminHomeController = (req, res) => {

    if (req.adminemail && req.role) {
        res.status(200).json({
            message: "You are successfully present in the admin Dashoard",
            email: req.adminemail,
            role: req.role
        })
    } else {
        res.status(404).json({ message: "You are not authorize admin" })
    }

}

const adminSalonController = (req, res) => {

    if (req.adminemail && req.role) {
        res.status(200).json({
            message: "Admin is now present in the Salon Dashboard",
            email: req.adminemail,
            role: req.role
        })
    } else {
        res.status(404).json({ message: "You are not authorize admin" })
    }

}

const createSalon = async (req, res) => {
    try {
        const { adminEmail, salonName, city, country, services } = req.body

        if (!adminEmail) {
            return res.status(404).json({ message: "AdminEmail Is Not Present " })
        }

        if (!salonName || !city || !country || !services || !adminEmail) {
            return res.status(404).json({ message: "All Salon Fields Required" })
        }

        const newSalon = await Salon.create({
            adminEmail,
            salonName,
            city,
            country,
            services
        })

        if (newSalon) {
            res.status(201).json({
                success: true,
                newSalon
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const salonList = async (req, res) => {
    try {
        const { adminEmail } = req.query

        if (!adminEmail) {
            return res.status(404).json({ message: "AdminEmail Is Not Present " })
        }

        const salon = await Salon.find({ adminEmail: adminEmail })

        if (!salon) {
            return res.status(404).json({ message: "No Salon Present For This Current AdminEmail" })
        }

        res.status(201).json({
            success: true,
            salon
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateSalon = async (req, res) => {
    try {
        const { adminEmail, salonName, city, country, services, salonId } = req.body;

        if (!adminEmail) {
            return res.status(404).json({ message: "AdminEmail Is Not Present" });
        }

        if (!salonId) {
            return res.status(404).json({ message: "SalonId is not Present" });
        }

        // Use findOne instead of find to get a single document
        const salon = await Salon.findOne({ adminEmail, _id: salonId });

        console.log(salon)

        if (!salon) {
            return res.status(404).json({ message: "Salon is not Present" });
        }

        // Update salon properties if they exist in the request body
        salon.salonName = salonName || salon.salonName;
        salon.city = city || salon.city;
        salon.country = country || salon.country;
        salon.services = services || salon.services;

        // Save the changes
        await salon.save();

        return res.status(200).json({
            success: true,
            salon,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const deleteSalon = async (req, res) => {
    try {
        const salonId = req.query.salonId;  // Access the salonId from req.query

        if (!salonId) {
            return res.status(404).json({
                message: "SalonId is not present in the query parameters"
            });
        }

        const deletedSalon = await Salon.findByIdAndDelete(salonId);

        if (!deletedSalon) {
            return res.status(404).json({
                message: `Salon with this ${salonId} not found`
            });
        }

        res.status(200).json({
            message: `Salon with this ${salonId} deleted successfully`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


//Image Upload

const path = require("path");
const fs = require('fs');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: "dfrw3aqyp",
    api_key: "574475359946326",
    api_secret: "fGcEwjBTYj7rPrIxlSV5cubtZPc"
});

// const uploadProfile = async (req, res, next) => {
//     try {
//         const profile = req.files.profile;
//         let email = req.body.email;

//         //Validate Image
//         const fileSize = profile.size / 1000;
//         const fileExt = profile.name.split(".")[1];

//         if (fileSize > 500) {
//             return res
//                 .status(400)
//                 .json({ message: "file size must be lower than 500kb" });
//         }

//         if (!["jpg", "png", "jfif"].includes(fileExt)) {
//             return res
//                 .status(400)
//                 .json({ message: "file extension must be jpg or png" });
//         }

//         // Generate a unique public_id based on the original file name
//         const public_id = `${profile.name.split(".")[0]}`;

//         // Upload the file to Cloudinary
//         //image upload korar jonno expresser bydefault kono req object thakena orjonno amake alada kore
//         //package like express-fileupload or multer use korte hbe nailes req.files.profile error show korbe
//         cloudinary.uploader.upload(profile.tempFilePath, {
//             public_id: public_id,
//             folder: "mernpro",
//         })
//             .then(async (image) => {

//                 // Delete the temporary file after uploading to Cloudinary
//                 fs.unlink(profile.tempFilePath, (err) => {
//                     if (err) {
//                         console.error(err);
//                     }
//                 });

//                 const imageUploaded = await User.create({
//                     profile: {
//                         public_id: [image.public_id,],
//                         url: [image.url],
//                     },
//                 });


//                 res.status(200).json({
//                     success: true,
//                     message: "File Uploaded successfully",
//                     imageUploaded
//                 });
//             })
//             .catch((err) => {
//                 console.error(err);
//                 res.status(500).json({ message: "Cloudinary upload failed" });
//             });
//         ;
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }


// VVP npm i sharp .This package is used to convert jpg,png images to webp formats

const uploadProfile = async (req, res, next) => {
    try {
        let profiles = req.files.profile;
        let email = req.body.email;

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
                        folder: "mernpro",
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

        const profileImages = await Promise.all(uploadPromises);

        const currentUser = await User.findOneAndUpdate(
            { email: email },
            { $push: { profile: { $each: profileImages } } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Files Uploaded successfully",
            currentUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const deleteProfile = async (req, res, next) => {
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
            res.status(404).json({ message: 'Image not found in the student profile' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


const updateProfile = async (req, res, next) => {
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


module.exports = {
    adminHomeController,
    adminSalonController,
    createSalon,
    salonList,
    updateSalon,
    deleteSalon,
    uploadProfile,
    updateProfile,
    deleteProfile
}