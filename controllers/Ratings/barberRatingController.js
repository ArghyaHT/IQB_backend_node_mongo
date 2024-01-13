const BarberRating = require("../../models/barberratingModel");

const barberRating = async (req, res) => {
    try {
      const { salonId, barberId, rating, email } = req.body;
  
      // Validate if the required fields are present in the request body
      if (!salonId || !rating || !email || !barberId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters (salonId, rating, email, barberId).',
        });
      }
  
      // Find the SalonRating document based on salonId
      let barberRatingDoc = await BarberRating.findOne({ salonId, barberId });
  
      // If SalonRating document doesn't exist, create a new one
      if (!barberRatingDoc) {
        barberRatingDoc = new BarberRating({
          salonId,
          barberId,
          ratings: [{ rating, email }],
        });
      } else {
        // SalonRating document exists, add the new rating to the ratings array
        barberRatingDoc.ratings.push({ rating, email });
      }
  
      // Save the updated SalonRating document
      await barberRatingDoc.save();
  
      res.status(200).json({
        success: true,
        message: 'Rating added successfully.',
        response: barberRatingDoc,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Failed to add rating. Please try again.',
        error: error.message,
      });
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
                $unwind: "$ratings",
            },
            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "$ratings.rating",
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