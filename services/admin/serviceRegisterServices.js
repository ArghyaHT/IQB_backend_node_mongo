const Service = require("../../models/servicesModel.js")
const Salon = require("../../models/salonsRegisterModel.js")
const Barber = require("../../models/barberRegisterModel.js")

const cretaeNewSalonService = async (serviceName, serviceDesc, servicePrice, salonId) => {

    const name = serviceName;
    const desc = serviceDesc;
    const price = servicePrice
    const searchSalonById = salonId;


    try {

        const salon = await Salon.findOne({ salonId: searchSalonById })

        if (!salon) {
            return ({
                status: 404,
                message: 'Salon not found'

            });
        }
        let salonService = await Service.findOne({ salonId: searchSalonById });

        if (!salonService) {
            // If no existing service document, create a new one
            salonService = new Service({
                salonId: searchSalonById,
                services: [],
            });
        }
        await salonService.save();


        const nextServiceId = `${searchSalonById}${salonService.services.length + 1}`;
        const firstTwoLetters = name.slice(0, 2).toUpperCase();

        const serviceCode = firstTwoLetters + nextServiceId;

        const newService = {
            serviceId: nextServiceId,
            serviceName: name,
            serviceCode: serviceCode,
            serviceDesc: desc,
            servicePrice: price,
        };

        // Push the new service to the existing salon's Services array
        salonService.services.push(newService);

        const savedSalonService = await salonService.save();

        return {
            status: 200,
            response: savedSalonService,
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

const getAllServicesBySalonId = async (salonId) => {
    try {
        const allServices = await Service.findOne({ salonId }, { services: 1 });

        if (!allServices) {
            return ({
                status: 404,
                message: 'Salon not found'
            })
        }
        return {
            status: 200,
            response: allServices,
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

const updateBarberAndService = async (barberId, selectedServices) => {

    try {
        if (!Array.isArray(selectedServices)) {
            return res.status(400).json({ error: 'selectedServices should be an array' });
        }
        // Update the Barber model with selected services
        const barber = await Barber.findOneAndUpdate(
            { barberId: barberId },
            { $push: { barberServices: { $each: selectedServices.map(serviceId => ({ serviceId })) } } },
            { new: true }
        );

        // Update the Service model with barber information
        await Service.updateMany(
            { serviceId: { $in: selectedServices } },
            { $addToSet: { supportedBarbers: { barberId: barber.barberId, barberEmail: barber.email } } }
        );

        return ({
            status: 200,
            message: 'Services selected successfully'
        });
    }

    catch (error) {
        return ({
            status: 500,
            message: 'Services not inserted'
        });
    }
}

const getBarbersByServiceId = async (salonId, serviceId) => {
    try {
        salonId = Number(salonId); // Ensure salonId is a number
        serviceId = Number(serviceId); // Ensure serviceId is a number

        const service = await Service.findOne({ salonId: salonId, 'services.serviceId': serviceId });

        if (!service) {
            return {
                status: 404,
                success: false,
                error: 'Service not found'
            };
        }

        const supportedBarbers = service.services.find(s => s.serviceId === serviceId).supportedBarbers;

        const barberDetails = await Barber.find({ barberId: { $in: supportedBarbers.map(b => b.barberId) } });

        return {
            success: true,
            status: 200,
            response: barberDetails
        };
    } catch (error) {
        console.error(error.message);
        return {
            status: 500,
            error: 'Failed to get barbers'
        };
    }
}

module.exports = {
    cretaeNewSalonService,
    getAllServicesBySalonId,
    updateBarberAndService,
    getBarbersByServiceId,

}
