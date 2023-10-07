const  barberServiceBybarberId = require("../../services/barber/barberService.js")



const barberServiceBybarberIdServiceId = async(req, res) => {
    try{
        const {salonId, barberId}= req.body;
        const selectedSecvices = req.body
        const result = await barberServiceBybarberId.addBarberServices(salonId, barberId, selectedSecvices);
    
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


    module.exports = {
        barberServiceBybarberIdServiceId
    }