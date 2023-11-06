const BarberWorking = require("../../models/barberWorkingModel")
const Barber = require("../../models/barberRegisterModel")

const isBarberOnline = async (req, res) => {
  try {
    const { barberId, salonId } = req.query;
    const { isOnline } = req.body;

    const updatedBarber = await Barber.findOneAndUpdate(
      { salonId, barberId },
      { $set:{isOnline:isOnline }},
      { new: true });

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