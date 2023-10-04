const barberService = require("../../services/barber/barberRegisterService.js")

const {barberValidateSignUp} = require("../../middlewares/barberRegisterValidate.js")


const registerBarber = async(req, res) => {
try{
    const barberData = req.body;

    barberValidateSignUp[req]

    const result = await barberService.createBarber(barberData);

    res.status(result.status).json({
   
        status: result.status,
        response: result.response,
      });
    
}
catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create Barber'
    });
  }
}

const getAllBarberbySalonId = async(req, res) =>{
  const {salonId} =  req.body;
  try{
    const result = await barberService.getAllBarbersBySalonId(salonId)
    
    res.status(result.status).json({
      status: result.status,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to get Barbers'
    });
  }
}

const updateBarber = async(req, res) =>{
  const {email} = req.body
  const barberData = req.body
  barberValidateSignUp[req]
  try{
    const result = await barberService.updateBarberByEmail(email, barberData)

    res.status(result.status).json({
      status: result.status,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to Update Barber'
    });
  }
}

const deleteBarber = async(req, res) =>{
  const {email, salonId} = req.body;
  try{
    const result = await barberService.deleteBarberByEmail(salonId, email);

    res.status(result.status).json({
      status: result.status,
      response: result.response,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: 'Failed to Update Barber'
    });
  }
}




module.exports = {
    registerBarber,
    getAllBarberbySalonId,
    updateBarber,
    deleteBarber,
}