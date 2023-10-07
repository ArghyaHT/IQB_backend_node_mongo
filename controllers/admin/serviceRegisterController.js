const serviceRegister = require("../../services/admin/serviceRegisterServices.js")

const createService = async(req, res) =>{
  try{
    const {serviceName, serviceDesc, servicePrice} = req.body;
    const {salonId} = req.body;

    const result = await serviceRegister.cretaeNewSalonService(serviceName,serviceDesc,servicePrice, salonId);
    res.status(result.status).json({
        response: result.response,
        error: result.error
      });
  } 
    catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Failed to create Salon'
      });
    }
}

const getAllServicesBySalonId = async(req, res) =>{
  try{

    const {salonId} = req.body;

    const result = await serviceRegister.getAllServicesBySalonId(salonId);
    res.status(result.status).json({
        response: result.response,
        error: result.error
      });
  } 
    catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Failed to create Salon'
      });
    }
}

const updateBarberServicesAndServiceSupportedBarber = async(req, res) =>{
  try{

    const {barberId} = req.body;
    const selectedServices = req.body

    const result = await serviceRegister.updateBarberAndService(barberId, selectedServices);
    res.status(result.status).json({
        response: result.response,
        error: result.error
      });
  } 
    catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Failed to add services'
      });
    }
}




module.exports ={
    createService,
    getAllServicesBySalonId, 
    updateBarberServicesAndServiceSupportedBarber,
}