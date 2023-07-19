const PlaceListConstants = require("../../Constants/PlaceList");
const Mysql = require("../../DB/Mysql");
const Joi = require('joi');

const PLACETYPE = [
    PlaceListConstants.POPULAR_DESTINATION,
    PlaceListConstants.TEMPLE,
    PlaceListConstants.LAKE,
    PlaceListConstants.MOUNTAIN,
    PlaceListConstants.BEACH,
    PlaceListConstants.FOOD_AND_RESTAURANTS,
    PlaceListConstants.CAFE,
    PlaceListConstants.BARS_AND_DRINKING
]

const PlaceList = async (req, res) => {
    const schema = Joi.object({
        placeType: Joi.string().valid(...PLACETYPE).required(),
        limit: Joi.number().default(10),
        offset: Joi.number().default(0),
        city_id: Joi.number().required()
    });
    const { placeType, limit=10, offset=1,city_id } = req.body;

    try {
        const { error } = schema.validate({ placeType, limit, offset, city_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find place list.',
                error: error.details[0].message
            });
        }
        const Page = (offset - 1) * limit;

        let placeList = await getPlaceList(placeType, limit, Page, city_id);
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

const getPlaceList = async (placeType, limit, offset,city_id) => {
    try {
        if (placeType == PlaceListConstants.POPULAR_DESTINATION) {
            //place with most rating and most viewed
            let query = `SELECT * FROM place WHERE city_id=${city_id} ORDER BY rating DESC, total_visited DESC LIMIT ${limit} OFFSET ${offset}`;
            let placeList = await Mysql.execute(query);
            return placeList[0];
        }
        let query = `SELECT * FROM place WHERE place_type='${placeType}' and city_id=${city_id} ORDER BY rating DESC, total_visited DESC LIMIT ${limit} OFFSET ${offset}`;
        let placeList = await Mysql.execute(query);
        return placeList[0];
    } catch (error) {
        
    }
  
}

///place info

const PlaceInfo = async (req,res) => {
    const schema = Joi.object({
        place_id: Joi.number().required()
    });
    const { place_id } = req.params;

    try {
        const { error } = schema.validate({ place_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find place info.',
                error: error.details[0].message
            });
        }

        let placeInfo = await getPlaceInfo(place_id);
        if (!placeInfo) return res.json({
            message: 'Not able to find place info.',
            error: 'No Place Found',
            placeInfo:{}
        });

        res.json({
            message: 'Place Info Found Successfully.',
            placeInfo: placeInfo
        });
    } catch (error) {
        res.status(400).json({
            message: 'Place Info Error.',
            error: error
        });
    }

}
const getPlaceInfo = async (place_id) => {
    try {
        let query = `SELECT * FROM place WHERE place_id=${place_id}`;
        let placeInfo = await Mysql.execute(query);
        return placeInfo[0][0];
    } catch (error) {
        
    }
}
const PlaceInfoWithAuth = async (req,res) => {
    const schema= Joi.object({
        userid: Joi.number().required(),
        place_id: Joi.number().required()
    });

    const { userid } = req.user
    const { place_id } = req.params;
    try {
        const { error } = schema.validate({ userid,place_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find place info.',
                error: error.details[0].message
            });
        }

        let placeInfo = await getPlaceInfoWithAuth(place_id,userid);
        if (!placeInfo) return res.json({
            message: 'Not able to find place info.',
            error: 'No Place Found',
            placeInfo: {}
        });

        res.json({
            message: 'Place Info Found Successfully.',
            placeInfo: placeInfo
        });
        
    } catch (error) {
        
    }

}
const getPlaceInfoWithAuth = async (place_id,userid) => {
    try {
        let query = `SELECT * FROM place WHERE place_id=${place_id}`;
        let placeInfo = await Mysql.execute(query);
        let query2 = `SELECT * FROM favorite WHERE place_id=${place_id} AND user_id=${userid}`;
        let placeInfo2 = await Mysql.execute(query2);
        if(placeInfo2[0].length>0){
            placeInfo[0][0].is_fav = true;
        }else{
            placeInfo[0][0].is_fav = false;
        }
        return placeInfo[0][0];
    } catch (error) {
        
    }
}


//update favorite
const updateFavorite = async (req,res) => {
    const schema = Joi.object({
        userid: Joi.number().required(),
        place_id: Joi.number().required()
    });

    const { userid } = req.user
    const { place_id } = req.params;
    try {
        const { error } = schema.validate({ userid,place_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to update favorite.',
                error: error.details[0].message
            });
        }

        let placeInfo = await FavoriteActions(place_id,userid);
        if (!placeInfo) return res
        .status(400)
        .json({
            message: 'Not able to update favorite.',
            error: 'No Place Found',
        });

        return res.json({
            message: 'Favorite Updated Successfully.',

        })
        
    } catch (error) {
        res.status(400).json({
            message: 'Favorite Update Error.',
            error: error
        });
        
    }

}

const FavoriteActions = async (place_id,userid) => {
    try {
        let query = `SELECT * FROM favorite WHERE place_id=${place_id} AND user_id=${userid}`;
        let placeInfo = await Mysql.execute(query);
        if(placeInfo[0].length>0){
            let query2 = `DELETE FROM favorite WHERE place_id=${place_id} AND user_id=${userid}`;
            let placeInfo2 = await Mysql.execute(query2);
            return placeInfo2[0];
        }else{
            let query2 = `INSERT INTO favorite (place_id,user_id) VALUES (${place_id},${userid})`;
            let placeInfo2 = await Mysql.execute(query2);
            return placeInfo2[0];
        }
        
    } catch (error) {
        return false;
        
    }

}


module.exports = {
    PlaceList,
    PlaceInfo,
    PlaceInfoWithAuth
}