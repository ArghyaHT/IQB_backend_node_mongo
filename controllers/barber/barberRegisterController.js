const barberService = require("../../services/barber/barberRegisterService.js")

const { barberValidateSignUp } = require("../../middlewares/barberRegisterValidate.js")

const Barber = require("../../models/barberRegisterModel.js")

const { auth } = require("../../utils/AuthUser");


// const registerBarber = async (req, res) => {
//   try {
//     const barberData = req.body;
//     barberValidateSignUp[req]

//     const result = await barberService.createBarber(barberData);

//     res.status(result.status).json({
//       success: true,
//       response: result.response,

//     });

//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create Barber',

//     });
//   }
// }



const barberLogin = async(req, res) => {
  try {
    const newuser = req.user

    const barberExists = await Barber.findOne({ email: newuser.decodeValue.email })

    if (!barberExists) {
        //create new user
        try {
          const barberId = await Barber.countDocuments() + 1;
          
          const firstTwoLetters = newuser.decodeValue.name ? newuser.decodeValue.name.slice(0, 2).toUpperCase() : newuser.name.slice(0,2).toUpperCase();

          const barberCode = firstTwoLetters + barberId; 

          console.log("barberId",barberId)
          console.log("barberCode",barberCode)


            const newUser = new Barber({
                name: newuser.decodeValue.name || newuser.name,
                email: newuser.decodeValue.email,
                email_verified: newuser.decodeValue.email_verified,
                auth_time: newuser.decodeValue.auth_time,
                barberId:barberId,
                barberCode:barberCode,
                isBarber:newuser.barber
            })

            const savedUser = await newUser.save()

            res.status(200).json({
                success: true,
                message: "Barber created successfully",
                user: savedUser
            })
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error
            })
        }

    } else {
        try {
            const filter = { email: newuser.decodeValue.email }
            const options = {
                upsert: true,
                new: true
            }

            const result = await Barber.findOneAndUpdate(filter, {
                $set: {
                    auth_time: newuser.decodeValue.auth_time
                }
            }, options)

            res.status(200).json({
                success: true,
                message: "Barber auth time updated successfully",
                user: result
            })
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error
            })
        }
    }

} catch (error) {
    return res.status(404).json({
        success: false,
        message: error
    })
}
}

// const barberLogin = async(req, res) => {
//   try {
//     const newuser = req.user

//     const userExists = await Barber.findOne({ email: newuser.decodeValue.email })

//     if (!userExists) {
//         //create new user
//         try {
//             const newUser = new Barber({
//                 name: newuser.decodeValue.name || newuser.name,
//                 email: newuser.decodeValue.email,
//                 email_verified: newuser.decodeValue.email_verified,
//                 auth_time: newuser.decodeValue.auth_time,
//                 isBarber:newuser.barber
//             })

//             const savedUser = await newUser.save()

//             res.status(200).json({
//                 success: true,
//                 message: "Barber created successfully",
//                 user: savedUser
//             })
//         } catch (error) {
//             return res.status(400).json({
//                 success: false,
//                 message: error
//             })
//         }

//     } else {
//         try {
//             const filter = { email: newuser.decodeValue.email }
//             const options = {
//                 upsert: true,
//                 new: true
//             }

//             const result = await Barber.findOneAndUpdate(filter, {
//                 $set: {
//                     auth_time: newuser.decodeValue.auth_time
//                 }
//             }, options)

//             res.status(200).json({
//                 success: true,
//                 message: "Barber auth time updated successfully",
//                 user: result
//             })
//         } catch (error) {
//             return res.status(404).json({
//                 success: false,
//                 message: error
//             })
//         }
//     }

// } catch (error) {
//     return res.status(404).json({
//         success: false,
//         message: error
//     })
// }
// }

// const addServicesTobarbers = async (req, res) => {
//   try {
//     const { salonId, barberId } = req.body;
//     const selectedServicesArray = req.body.selectedServices;
//     const result = await barberService.addBarberServices(salonId, barberId, selectedServicesArray);

//     res.status(result.status).json({
//       success: true,
//       response: result.response,
//     });

//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create Barber'
//     });
//   }
// }

// const getAllBarberbySalonId = async (req, res) => {
//   const { salonId } = req.body;
//   try {
//     const result = await barberService.getAllBarbersBySalonId(salonId)

//     res.status(result.status).json({
//       success: true,
//       response: result.response,

//     });
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get Barbers'
//     });
//   }
// }

const getAllBarberbySalonId = async (req, res) => {
  try {
    // const getAllBarbers = await Barber.find({salonId: salonId})

    const { salonId, name, email, page = 1, limit = 3, sortField, sortOrder } = req.query
    let query = {}

    const searchRegExpName = new RegExp('.*' + name + ".*", 'i')
    const searchRegExpEmail = new RegExp('.*' + email + ".*", 'i')

    if (salonId) {
      query.salonId = salonId
    }

    if (name || email) {
      query.$or = [
        { name: { $regex: searchRegExpName } },
        { email: { $regex: searchRegExpEmail } }
      ];
    }

    const sortOptions = {};
    if (sortField && sortOrder) {
      sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = Number(page - 1) * Number(limit)

    const getAllBarbers = await Barber.find(query).sort(sortOptions).skip(skip).limit(Number(limit))

    const totalBarbers = await Barber.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "All barbers fetched successfully",
      getAllBarbers,
      totalPages: Math.ceil(totalBarbers / Number(limit)),
      currentPage: Number(page),
      totalBarbers,
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

const updateBarber = async (req, res) => {
  const barberData = req.body
  try {
    const result = await barberService.updateBarberByEmail(barberData)

    res.status(result.status).json({
      success: true,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to Update Barber'
    });
  }
}

const deleteBarber = async (req, res) => {
  const { salonId } = req.query;
  const {email} = req.body
  try {
    const result = await barberService.deleteBarberByEmail(salonId, email);

    res.status(result.status).json({
      success:true,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to Update Barber'
    });
  }
}

const chnageBarberWorkingStatus = async(req, res) => {
  try {
    const { barberId } = req.params;
    const { isActive } = req.body;

    // Update the isActive status in the database
    const updatedBarber = await Barber.findOneAndUpdate(barberId, { isActive }, { new: true });

    if (!updatedBarber) {
      return res.status(404).json({ message: "Barber not found" });
    }

    return res.status(200).json(updatedBarber);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  
}


module.exports = {
  // registerBarber,
  barberLogin,
  getAllBarberbySalonId,
  updateBarber,
  deleteBarber,
  chnageBarberWorkingStatus,
  // addServicesTobarbers,
}

// https://iqb-frontend.netlify.app/