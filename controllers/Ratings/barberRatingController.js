const BarberRating = require("../../models/barberRatingModel");
const Barber = require("../../models/barberRegisterModel");

const barberRating = async (req, res, next) => {
    try {
      const { salonId, barberId, rating, email } = req.body;
  
      // Validate if the required fields are present in the request body
      if (!salonId || !rating || !email || !barberId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters (salonId, rating, email, barberId).',
        });
      }
    //Saving Salonrating
    const barberRating = new BarberRating({
      salonId: salonId,
      barberId: barberId,
      rating: rating,
      email: email
  })
      // Save the updated SalonRating document
      await barberRating.save();

      const barber = await Barber.findOneAndUpdate(
        { salonId: salonId, barberId: barberId }, // Filter object specifying which document to update
        { $push: { barberRatings: barberRating._id } }, // Update operation
        { new: true } // Optional: to return the updated document
    );

    res.status(200).json({
      success: true,
      message: 'Rating added successfully.',
      response: barberRating,
  });
    }catch (error) {
      console.log(error);
      next(error);
    }
  };

  async function getAverageBarberRating(salonId, barberId) {
    try {

        const numsalonId = Number(salonId)
        const numBarberId = Number(barberId)
        // Validate if salonId is provided
        if (!numsalonId || !numBarberId) {
            throw new Error('Missing required parameter: salonId pr barberId.');
        }
      // Aggregate to calculate the average rating
      const result = await BarberRating.aggregate([
        {
            $match: {
                salonId: numsalonId,
                barberId: numBarberId
            },
        },
        {
            $group: {
                _id: null,
                averageRating: {
                    $avg: "$rating",
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the _id field from the result
                averageRating: {
                    $round: ["$averageRating", 1], // Round the average rating to 1 decimal place
                },
            },
        },
    ]);

    // Extract the average rating from the result
    const averageRating = result.length > 0 ? result[0].averageRating : 0;

    return averageRating;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get average rating. Please try again.');
    }
}

  module.exports = {
   barberRating,
   getAverageBarberRating
}