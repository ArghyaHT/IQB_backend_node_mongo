const Barber = require("../../models/barberRegisterModel.js")
const Salon = require("../../models/salonsRegisterModel.js")


const createBarber = async(barberData, barberServices) => {
const {
email, 
firstName,
lastName,
userName,
mobileNumber,
dateOfBirth,
salonId,
isActive,
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
    })
  

    const savedBarber = await barber.save();
    
    await Salon.findOneAndUpdate({
        SalonId: salonId
    },
    {
        $push: {
          RegisteredBarber: {
            BarberId: barberId, 
            BarberEmail: email  
          },
        },
      },
      {new: true})
    
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


const getAllBarbersBySalonId = async(salonId) =>{
try{
    const getAllBarbers = await Barber.find({SalonId: salonId})

    return {
        status: 200,
        response: getAllBarbers,
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


const updateBarberByEmail = async(email, barberData) =>{
const{
    firstName,
    lastName,
    mobileNumber,
} = barberData
try{
    const updateBarber = await Barber.findOneAndUpdate(
        {Email: email},
        {FirstName: firstName, LastName:lastName, MobileNumber: mobileNumber},
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
        const deleteBarber = await Barber.deleteOne({Email: email});

        await Salon.findOneAndUpdate({
            SalonId: salonId
        },
        {
            $pull: {
              RegisteredBarber: {
                BarberEmail: email  
              },
            },
          },
          {new: true})
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
    getAllBarbersBySalonId,
    updateBarberByEmail,
    deleteBarberByEmail
}