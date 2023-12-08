const Barber = require("../../models/barberRegisterModel.js")
const Salon = require("../../models/salonsRegisterModel.js")


const insertBarberDetails = async (barberData) => {
    const { email, name, isActive, userName, mobileNumber, dateOfBirth} = barberData

    try {
        const existingBarber = await Barber.findOne({ email })

        if (existingBarber) {
            const firstTwoLetters = name.slice(0, 2).toUpperCase();
            const barberCode = firstTwoLetters + existingBarber.barberId;

            existingBarber.name = name;
            existingBarber.barberCode = barberCode;
            existingBarber.isActive = isActive;
            existingBarber.userName = userName;
            existingBarber.mobileNumber = mobileNumber;
            existingBarber.dateOfBirth = dateOfBirth;
            // existingBarber.salonId = salonId;
            existingBarber.barberServices = barberServices;
      
            const updatedBarber = await existingBarber.save();
            return {
                status: 200,
                message: 'Barber details updated successfully',
                response: updatedBarber,
              };
            } else {
              return {
                status: 404,
                message: 'Barber not found',
              };
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

const updateBarberByEmail = async (barberData) => {

    const { salonId, name, email, userName, mobileNumber, dateOfBirth, barberServices } = barberData
    try {

        const barber = await Barber.findOneAndUpdate({ email: email },
            {
                name: name,
                salonId: salonId,
                userName: userName,
                mobileNumber: mobileNumber,
                dateOfBirth: dateOfBirth,
                barberServices: barberServices,
            },
            { new: true })
        return {
            status: 200,
            response: barber,
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

const deleteBarberByEmail = async (salonId, email) => {
    try {
        const deleteBarber = await Barber.findOneAndUpdate({ salonId: salonId, email: email }, { isDeleted: true }, { new: true });

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
    insertBarberDetails,
    // getAllBarbersBySalonId,
    updateBarberByEmail,
    deleteBarberByEmail,
    // addBarberServices
}
