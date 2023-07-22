const Mysql = require("../../DB/Mysql");
const Joi = require('joi');

const getUserFavPlaces = async (req, res) => {
    const schema = Joi.object({
        limit: Joi.number().default(10),
        offset: Joi.number().default(1),
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
        res.status(400).json({
            message: 'Place List Error',
            error: error
        });
        
    }
}

const getFavPlaceList = async (user_id, limit, offset) => {
    try {
        let sql = `SELECT * FROM place WHERE place_id IN (SELECT place_id FROM favorite  WHERE user_id = ${user_id}) LIMIT ${limit} OFFSET ${offset}`;
        let result = await Mysql.execute(sql);
        return result[0];
    } catch (error) {
        throw error;
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
            error: error
        });
        
    }
}

const deleteFavPlace = async (user_id, place_id) => {
    try {
        let sql = `DELETE FROM favorite WHERE user_id = ${user_id} AND place_id = ${place_id}`;
        let result = await Mysql.execute(sql);
        return true
    } catch (error) {
        throw error;

    }

}


module.exports = {
    getUserFavPlaces,
    deletFromFavPlaceApi
}