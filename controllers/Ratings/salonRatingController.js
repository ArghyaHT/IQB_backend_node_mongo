const SalonRating = require("../../models/salonRatingModel");
const Salon = require("../../models/salonsRegisterModel");

const salonRating = async (req, res, next) => {
    try {
        const { salonId, rating, email } = req.body;

        // Validate if the required fields are present in the request body
        if (!salonId || !rating || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters (salonId, rating, email).',
            });
        }
        //Saving Salonrating
        const salonRating = new SalonRating({
            salonId: salonId,
            rating: rating,
            email: email
        })
        await salonRating.save();

        const salon = await Salon.findOneAndUpdate(
            { salonId: salonId }, // Filter object specifying which document to update
            { $push: { salonRatings: salonRating._id } }, // Update operation
            { new: true } // Optional: to return the updated document
        );

        res.status(200).json({
            success: true,
            message: 'Rating added successfully.',
            response: salonRating,
        });
    } catch (error) {
        console.log(error);
        next(error);
 }
};

// Function to calculate the average rating for a salon
async function getAverageRating(salonId) {
    try {
        const numsalonId = Number(salonId);
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
    salonRating,
    getAverageRating
}