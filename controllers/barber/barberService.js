const barberServiceBybarberId = require("../../services/barber/barberService.js")



const barberServiceBybarberIdServiceId = async (req, res) => {
  try {
    const { salonId, barberId } = req.body;
    const selectedServicesArray = req.body.selectedServices;
    const result = await barberServiceBybarberId.addBarberServices(salonId, barberId, selectedServicesArray);

    res.status(result.status).json({
      response: result.response,
    });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create Barber'
    });
  }
}


const getBarberServicesByBarberId = async (req, res) => {
  try {
    const { barberId } = req.body;
    const result = await barberServiceBybarberId.getServicesByBarberId(barberId);

    res.status(result.status).json({
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to get Services'
    });
  }
}


const deletebarberServiceBybarberIdServiceId = async (req, res) => {
  try {
    const { salonId, barberId } = req.body;
    const selectedServicesArray = req.body.selectedServices;
    const result = await barberServiceBybarberId.deleteBarberServices(salonId, barberId, selectedServicesArray);

    res.status(result.status).json({
      response: result.response,
    });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create Barber'
    });
  }
}


module.exports = {
  barberServiceBybarberIdServiceId,
  getBarberServicesByBarberId,
  deletebarberServiceBybarberIdServiceId
}