const BarberWorking = require("../../models/barberWorkingModel")

const isBarberOnline = async(req, res) =>{
    try {
        const { barberId, salonId } = req.query;
        const { isOnline } = req.body;
    
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