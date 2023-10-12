const Barber = require("../../models/barberRegisterModel.js")
const Salon = require("../../models/salonsRegisterModel.js")


const createBarber = async(barberData) => {
const {
email, 
firstName,
lastName,
userName,
mobileNumber,
dateOfBirth,
salonId,
isActive,
barberServices
} = barberData

try{
    const barberId = await Barber.countDocuments() + 1;
    const firstTwoLetters = firstName.slice(0, 2).toUpperCase()

    const barberCode = firstTwoLetters + salonId 

    const existingBarber = await Barber.findOne({email})

    if(existingBarber){
        return {
            status: 400,
            response: 'A barber with the provided Email already exists',
          };
    }
    
    const barber = new Barber({
        email: email,
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        mobileNumber: mobileNumber,
        dateOfBirth: dateOfBirth,
        salonId: salonId,
        isActive: isActive,
        barberId: barberId,
        barberCode: barberCode,
        barberServices: barberServices
    })
  

    const savedBarber = await barber.save();
    
    // await Salon.findOneAndUpdate({
    //     SalonId: salonId
    // },
    // {
    //     $push: {
    //       RegisteredBarber: {
    //         BarberId: barberId, 
    //         BarberEmail: email  
    //       },
    //     },
    //   },
    //   {new: true})
    
    return {
        status: 200,
        response: savedBarber,
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


// const addBarberServices = async (salonId, barberId, selectedServicesArray) => {
//     try {
//       // Fetch the barber details from the 'Barber' model
//       const barber = await Barber.findOne({ barberId: barberId });
  
//       if (!barber) {
//         return {
//           status: 404,
//           error: 'Barber not found',
//         };
//       }
  
//       const barberEmail = barber.email; // Retrieve the barberEmail
//       // You can retrieve other barber details as needed
  
//       const matchSalonServices = await Salon.find({
//         salonId: salonId,
//         'services.serviceId': { $in: selectedServicesArray },
//       });
  
//       console.log(matchSalonServices);


//       const barberServiceDocs = matchSalonServices.services.map((service) => {
//         const selectedServiceIds = service.services
//           .filter((s) => selectedServicesArray.includes(s.serviceId))
//           .map((s) => ({
//             serviceId: s.serviceId,
//             serviceCode: s.serviceCode,
//             serviceName: s.serviceName,
//           }));

//       console.log(barberServiceDocs )
//         // Include selected services and supported barbers in the document
//         return {
//           barberServices: selectedServiceIds,
//           barberServiceDocs,
//           supportedBarbers: [
//             {
//               barberId: barberId,
//               barberEmail: barberEmail,
//             },
//           ],
//         };
//       });

//       const updatedBarberServices = barberServiceDocs.map((doc) => doc.barberServices);

//       console.log(updatedBarberServices)
    
    
    
//     //  // Update the existing 'Barber' document
//     // const updatedBarber =  await Barber.updateOne(
//     //     { barberId: barber.barberId },
//     //     {
//     //         $push: {
//     //           // barberServices: { $each: barberServiceDocs.map(doc => doc.barberServices) },
//     //           barberServices: updatedBarberServices
//     //         },
//     //     },
//     //     {new: true}
//     //   );
  
  
//       console.log('Inserted barberService documents:', updatedBarber);
  
//       // Update the 'Service' model to add 'barberId' and 'barberEmail' for each service
//       // for (const serviceId of selectedServicesArray) {
//       //   await Salon.findOneAndUpdate(
//       //     { 'services.serviceId': serviceId },
//       //     {
//       //       $push: {
//       //         'services.$.supportedBarbers': {
//       //           barberId: barberId,
//       //           barberEmail: barberEmail,
//       //         },
//       //       },
//       //     },
//       //     { new: true }
//       //   );
//       // }
  
//       console.log('Barber added to services');
  
//       return {
//         status: 200,
//         response: 'Barber services and supported Barbers added successfully',
//       };
//     } catch (error) {
//       console.log(error.message);
//       return {
//         status: 500,
//         error: 'Failed to create customer',
//       };
//     }
//   };


// const getAllBarbersBySalonId = async(salonId) =>{
// try{
//     const getAllBarbers = await Barber.find({salonId: salonId})

//     return {
//         status: 200,
//         response: getAllBarbers,
//     }

// }
// catch (error) {
//     console.log(error.message)
//     return {
//       status: 500,
//       message: error.message,
//  };
// }
// }

// const getAllBarbersBySalonId = async(salonId,res ) =>{
//     try{
//         // const getAllBarbers = await Barber.find({salonId: salonId})
    
//         const {salonId,page = 1, limit = 1} = req.query
//         let query = {}

//         const skip = Number(page - 1) * Number(limit)

//         const getAllBarbers = await Barber.find({salonId: salonId}).skip(skip).limit(Number(limit))
//         res.status(200).json({
//             success:true,
//             message:"All barbers",
//             getAllBarbers
//         })
    
//     }
//     catch (error) {
//         console.log(error.message)
//         return {
//           status: 500,
//           message: error.message,
//      };
//     }
//     }


const updateBarberByEmail = async(email, barberData) =>{
const{
    firstName,
    lastName,
    mobileNumber,
} = barberData
try{
    const updateBarber = await Barber.findOneAndUpdate(
        {email: email},
        {firstName: firstName, lastName:lastName, mobileNumber: mobileNumber},
        {new:true})

        return {
            status: 200,
            response: updateBarber,
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

const deleteBarberByEmail = async(salonId, email) =>{
    try{
        const deleteBarber = await Barber.deleteOne({salonId: salonId, email: email});

        // await Salon.findOneAndUpdate({
        //     SalonId: salonId
        // },
        // {
        //     $pull: {
        //       RegisteredBarber: {
        //         BarberEmail: email  
        //       },
        //     },
        //   },
        //   {new: true})
        return {
            status: 200,
            response: deleteBarber,
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


module.exports = {
    createBarber,
    // getAllBarbersBySalonId,
    updateBarberByEmail,
    deleteBarberByEmail,
    // addBarberServices
}
