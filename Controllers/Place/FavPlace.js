const Joi = require('joi');
const MongoDb = require("../../DB/MongoDb");

const getUserFavPlaces = async (req, res) => {
    const schema = Joi.object({
        limit: Joi.number().default(10).max(100),
        offset: Joi.number().default(1).max(20),
    });
    try {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                message: 'Not able to find place list.',
                error: error.details[0].message
            });
        }
        const { limit = 10, offset = 1 } = req.query;
        const Page = (offset - 1) * limit;
        let placeList = await getFavPlaceList(req.user.userid, limit, Page);
        if (!placeList) return res.json({
            message: 'Not able to find place list.',
            error: 'No Place Found',
            placeList: []
        });

        res.json({
            message: 'Place List Found Successfully.',
            placeList: placeList
        });
        
    } catch (error) {
        console.error(error)
        res.end(500).json({
            message: 'server error',
            error: 'not abe to find place list'
        });
        
    }
}

const getFavPlaceList = async (user_id, limit, offset) => {
    try {
        const db = await MongoDb.connect()
        let result = await db.collection('place').aggregate(
            [
                {
                    $lookup:{
                        from:"favorite",
                        localField: "place_id",
                        foreignField: "place_id",
                        as: 'favoritedetails'


                    }
                },
                {
                    $match:{
                        "favoritedetails.user_id": user_id
                    }
                },
                {
                    $project:{
                        "favoritedetails":0,
                        _id:0
                    }
                }
            ]
        ).skip(offset)
        .limit(Number(limit)).toArray()
        return result;
    } catch (error) {
        throw error;
    }finally{
        
    }
}

const deletFromFavPlaceApi = async (req,res) => {
    const schema = Joi.object({
        place_id: Joi.number().required()
    });
    try {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
                error: error.details[0].message
            });
        }
        const { place_id } = req.query;
        let result = await deleteFavPlace(req.user.userid, place_id);
        if (!result) return res.json({
            message: 'Not able to remove from favorite.',
            error: 'No Place Found',
        });

       return res.json({
            message: 'Place Deleted Successfully.',
        });
        
    } catch (error) {
       return res.status(400).json({
            message: 'Place List Error',
            error: 'Not able to remove from favorite.'
        });
        
    }
}

const deleteFavPlace = async (user_id, place_id) => {
    try {
        const db = await MongoDb.connect()
        const deleteStatus = await db.collection('favorite').deleteOne({user_id: user_id, place_id: place_id})
        return deleteStatus?.deletedCount > 0
    } catch (error) {
        throw error;

    }

}


module.exports = {
    getUserFavPlaces,
    deletFromFavPlaceApi
}