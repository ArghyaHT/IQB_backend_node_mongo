const salonService = require("../../services/admin/salonRegisterService")

// Create a new Salon
const salonSignUp = async (req, res) => {
  try {
    const salonData = req.body;
    const {AdminEmail} = req.body


    const result = await salonService.createSalon(salonData, AdminEmail);

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
};

const searchSalonsByCity = async (req, res) => {

  try {
    const { city } = req.body
    const result = await salonService.searchSalonsByCity(city)

    res.status(result.status).json({

      status: result.status,
      message: result.message,
      response: result.data
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to search Salons'
    });
  }
}


const getSalonInfo = async (req, res) => {
  const { salonId } = req.body;

  try {
    const result = await salonService.getSalonInfoBySalonId(salonId)
    res.status(result.status).json({

      status: result.status,
      message: result.message,
      data: result.data
    })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to search Salons'
    });
  }
}

const updateSalonBySalonIdAndAdminEmail = async (req, res) => {

  try {
    const salonData  = req.body;
    const {salonId} = req.body
    const {adminEmail} = req.body
    
    const result = await salonService.updateSalonBySalonId(salonData, salonId, adminEmail);
   
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


module.exports = {
  salonSignUp,
  searchSalonsByCity,
  getSalonInfo, 
  updateSalonBySalonIdAndAdminEmail,
  allSalonServices,
  updateSalonServiceByServiceId,
  deleteServiceByServiceIdSalonId

}