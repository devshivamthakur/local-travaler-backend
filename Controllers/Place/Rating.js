const Joi = require('joi');
const MongoDb = require("../../DB/MongoDb");

const SubmitRating = async (req, res) => {

    const schema = Joi.object({
        place_id: Joi.number().required(),
        rating: Joi.number().required(),
        userid: Joi.number().required(),
    });

    const { place_id, rating } = req.body;
    const { userid } = req.user;

    try {
        const { error } = schema.validate({ place_id, rating, userid });
        if (error) {
            return res.status(400).json({
                message: 'Not able to submit rating.',
                error: error.details[0].message
            });
        }
        let submitRating = await submitRating_(place_id, rating, userid);
        if (!submitRating) return res.json({
            message: submitRating,
            error: 'No Rating Found',
        });
        res.json({
            message: 'Rating Submitted Successfully.',
        });
    } catch (error) {
        res.status(400).json({
            message: 'Rating Error',
            error: error
        });
    }
}

const submitRating_ = async (place_id, rating, user_id) => {
    try {
        const db = await MongoDb.connect()
        const ratingCollection = await db.collection('rating');

        const ratingExists = await ratingCollection.findOne({ place_id: Number(place_id), user_id: Number(user_id) })
        if (ratingExists) {
            return 'You have already given the rating .';

        }

        const insertRating = await ratingCollection.insertOne({
            rating: rating,
            place_id: Number(place_id),
            user_id: Number(user_id),
            created_at: new Date(),
            updated_at: new Date()
        })

        const avgRating = await ratingCollection.aggregate([
            {
                $match:{
                    place_id: Number(place_id)
                }
            },
            {
                $group:{
                    _id:"place_id",
                    avgRating:{
                        $avg:'$rating'
                    }
                }
            }
        ]).toArray()

        const ratingPlace = avgRating[0]?.avgRating 
        const updatePlace = await db.collection("place").updateOne({ place_id }, 
            {
                $set:{
                    rating: ratingPlace || 0
                }
            }
        )

        return "You have given rating successfully.";
    } catch (error) {
        throw error;
    }

}

module.exports = {
    SubmitRating
}