const Mysql = require("../../DB/Mysql");
const Joi = require('joi');

const SubmitRating = async (req, res) => {

    const schema = Joi.object({
        place_id: Joi.number().required(),
        rating: Joi.number().required(),
        userid: Joi.number().required(),
    });

    const { place_id, rating } = req.body;
    const { userid } = req.user;

    try {
        const { error } = schema.validate({ place_id, rating,userid });
        if (error) {
            console.log(error)
            
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
        console.log(error)

        res.status(400).json({
            message: 'Rating Error',
            error: error
        });
    }
}

const submitRating_ = async (place_id, rating,  user_id) => {
    try {
        //first check if user already rated this place
        let query1 = `SELECT * FROM rating WHERE place_id=${place_id} AND user_id=${user_id}`;
        let checkRating = await Mysql.execute(query1);
        if(checkRating[0].length > 0){
            return 'You have already given the rating .';
        }
        let query = `INSERT INTO rating (place_id, rating, user_id) VALUES (${place_id}, ${rating}, ${user_id})`;
        let submitRating = await Mysql.execute(query);
        let query2 = `UPDATE place SET rating = (SELECT AVG(rating) FROM rating WHERE place_id=${place_id}) WHERE place_id=${place_id}`;
        let submitRating2 = await Mysql.execute(query2);
        return "You have given rating successfully.";    
    } catch (error) {
        throw error;
    }
    return false;

}

module.exports = {
    SubmitRating
}