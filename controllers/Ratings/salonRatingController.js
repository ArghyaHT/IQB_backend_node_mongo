const SalonRating = require("../../models/salonRatingModel");

const salonRating = async (req, res) => {
    try {
        const { salonId, rating, email } = req.body;

        // Validate if the required fields are present in the request body
        if (!salonId || !rating || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters (salonId, rating, email).',
            });
        }

        // Find the SalonRating document based on salonId
        let salonRatingDoc = await SalonRating.findOne({ salonId });

        // If SalonRating document doesn't exist, create a new one
        if (!salonRatingDoc) {
            salonRatingDoc = new SalonRating({
                salonId,
                ratings: [{ rating, email }],
            });
        } else {
            // SalonRating document exists, add the new rating to the ratings array
            salonRatingDoc.ratings.push({ rating, email });
        }

        // Save the updated SalonRating document
        await salonRatingDoc.save();

        res.status(200).json({
            success: true,
            message: 'Rating added successfully.',
            response: salonRatingDoc,
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

async function getAverageRating(salonId) {
    try {

        const numsalonId = Number(salonId)
        // Validate if salonId is provided
        if (!numsalonId) {
            throw new Error('Missing required parameter: salonId.');
        }
        // Aggregate to calculate the average rating
        const result = await SalonRating.aggregate([
            {
                $match: {
                    salonId: numsalonId,
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
    salonRating,
    getAverageRating
}