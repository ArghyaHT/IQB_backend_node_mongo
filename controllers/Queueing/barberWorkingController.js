const BarberWorking = require("../../models/barberWorkingModel")

/// Need to check the api
const isBarberOnline = async(req, res) =>{
    try {
        const { barberId } = req.params;
        const  {salonId} = req.params;
        const { isOnline } = req.body;

        console.log('barberId:', barberId);
        console.log('salonId:', salonId);
        console.log('isOnline:', isOnline);
    
        const updatedBarber = await BarberWorking.findOneAndUpdate({salonId: salonId, barberId: barberId}, { isOnline }, { new: true });
    
        if (!updatedBarber) {
          return res.status(404).json({ message: "Barber not found" });
        }
    
        return res.status(200).json(updatedBarber);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
}


module.exports = {
    isBarberOnline,
}