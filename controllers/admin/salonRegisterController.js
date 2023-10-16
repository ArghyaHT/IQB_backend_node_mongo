const salonService = require("../../services/admin/salonRegisterService")

// Create a new Salon
const salonSignUp = async (req, res) => {
  try {
    const salonData = req.body;
    const {adminEmail} = req.body


    const result = await salonService.createSalon(salonData, adminEmail);

    res.status(result.status).json({
      success: true,
      response: result.response,
      message: result.message,
      error: result.error
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Salon'
    });
  }
};

const addServices = async(req, res) =>{
  try{
    const {serviceName, serviceDesc, servicePrice} = req.body;
    const {salonId} = req.body;

    const result = await salonService.addSalonServices(serviceName,serviceDesc,servicePrice, salonId);
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

const searchSalonsByCity = async (req, res) => {

  try {
    const { city } = req.body
    const result = await salonService.searchSalonsByCity(city)

    res.status(result.status).json({
      success: true,
      response: result.response,
      message: result.message,
     
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to search Salons'
    });
  }
}

const getSalonsByLocation = async (req, res) => {

  try {
    const { longitude, latitude } = req.query;
    const result = await salonService.searchSalonsByLocation(longitude, latitude)

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response
      
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to search Salons'
    });
  }
}


const getSalonInfo = async (req, res) => {
  const { salonId } = req.query;

  try {
    const result = await salonService.getSalonInfoBySalonId(salonId)
    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to search Salons'
    });
  }
}

const updateSalonBySalonIdAndAdminEmail = async (req, res) => {

  try {
    
    const result = req.body!= null ? await salonService.updateSalonBySalonId(req.body) : null;
   
    res.status(result.status).json({
      status: result.status,
      message: result.message,
      response: result.response
    })
}
catch (error) {
  console.error(error);
  res.status(500).json({
    status: 500,
    error: 'Failed to Update Salon'
  });
}
}

const allSalonServices = async(req, res) =>{
  const {salonId} = req.body;
  try{
    const result = await salonService.getAllSalonServices(salonId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to get services'
    });
  }
}

const updateSalonServiceByServiceId = async(req, res) =>{
  const {salonId, serviceId} = req.body
  const newServiceData = req.body;
  try{
    const result =  await salonService.updateSalonService(salonId, serviceId, newServiceData);
    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to update services'
    });
  }
}

const deleteServiceByServiceIdSalonId = async(req, res) =>{
  const {salonId, serviceId} = req.body;
  try{
    const result = await salonService.deleteSalonService(salonId, serviceId);

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.response
    })
}
catch (error) {
  console.error(error);
  res.status(500).json({
    status: 500,
    error: 'Failed to update services'
  });
}
}



const getAllSalonsByAdmin = async (req, res) => {

  try {
    const { adminEmail } = req.query;
    const result = await salonService.getSalonsByAdminEmail(adminEmail)

    res.status(result.status).json({
      success: true,
      message: result.message,
      response: result.response, 
      error: result.error   
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success:false,
      error: 'Failed to search Salons'
    });
  }
}


module.exports = {
  salonSignUp,
  searchSalonsByCity,
  getSalonsByLocation,
  getSalonInfo, 
  updateSalonBySalonIdAndAdminEmail,
  allSalonServices,
  updateSalonServiceByServiceId,
  deleteServiceByServiceIdSalonId,
  addServices,
  getAllSalonsByAdmin

}