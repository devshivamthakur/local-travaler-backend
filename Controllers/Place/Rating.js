const Joi = require('joi');
const ApiError = require('../../middleware/Apierrors');
const Rating = require('../../Modals/rating.modal');
const mongoose = require("mongoose");
const PlaceModal = require('../../Modals/place.modal');

const SubmitRating = async (req, res,next) => {

    const schema = Joi.object({
        place_id: Joi.string().required(),
        rating: Joi.number().required(),
        userid: Joi.string().required(),
    });

    const { place_id, rating } = req.body;
    const { userid } = req.user;

    try {
        const { error } = schema.validate({ place_id, rating, userid });
        if (error) {
            throw new ApiError(400, error.message)
        }

        await submitRating_(place_id, rating, userid);

        res.json({
            message: 'Rating Submitted Successfully.',
        });
    } catch (error) {
        next(error);
    }
}

const submitRating_ = async (place_id, rating, user_id) => {
    try {

        const ratingExists = await Rating.findOne({ place: new mongoose.Types.ObjectId(place_id), user: new mongoose.Types.ObjectId(user_id) })
        if (ratingExists) {
            return 'You have already given the rating .';
        }

        await Rating.create({
            rating: rating,
            place: new mongoose.Types.ObjectId(place_id),
            user: new mongoose.Types.ObjectId(user_id),
        })

        const avgRating = await Rating.aggregate([
            {
                $match:{
                    place: new mongoose.Types.ObjectId(place_id)
                }
            },
            {
                $group:{
                    _id:"place",
                    avgRating:{
                        $avg:'$rating'
                    }
                }
            }
        ])

        const ratingPlace = avgRating[0]?.avgRating 
        await PlaceModal.updateOne({ _id: new mongoose.Types.ObjectId(place_id) }, 
            {
                $set:{
                    rating: ratingPlace || 0
                }
            }
        )

        return "You have given rating successfully.";
    } catch (error) {
        throw new ApiError(500, "Server Error")
    }

}

module.exports = {
    SubmitRating
}