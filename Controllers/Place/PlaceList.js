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
        offset: Joi.number().default(1),
        city_id: Joi.number().required().min(1)


    });
    //city must be greater than 0

    const { placeType, limit=10, offset=1,city_id } = req.body;
    console.log(placeType)

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

        let query = `SELECT * FROM place WHERE place_category='${placeType}' and city_id=${city_id} ORDER BY rating DESC, total_visited DESC LIMIT ${limit} OFFSET ${offset}`;
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
        let images = await getPlaceImages(place_id);
        placeInfo[0][0].images = images;
        return placeInfo[0][0];
    } catch (error) {
        
    }
}
const getPlaceImages = async (place_id) => {
    try {
        let query =''
        // if(user_id){
        //     query=`SELECT place.*, rating.rating FROM place
        //     left JOIN rating on rating.place_id =place.place_id and rating.user_id= ${user_id}
        //     where place.place_id =${place_id} `
            
        // }else{

            query = `SELECT * FROM placeimage WHERE place_id=${place_id}`;
        
        
        let images = await Mysql.execute(query);
        return images[0];
    } catch (error) {
        return [];
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
        let query = `SELECT place.*, rating.rating as userRating FROM place left JOIN rating on rating.place_id =place.place_id and rating.user_id= ${userid} where place.place_id =${place_id} `;
        let placeInfo = await Mysql.execute(query);
        let query2 = `SELECT * FROM favorite WHERE place_id=${place_id} AND user_id=${userid}`;
        let placeInfo2 = await Mysql.execute(query2);
        if(placeInfo2[0].length>0){
            placeInfo[0][0].is_fav = true;
        }else{
            placeInfo[0][0].is_fav = false;
        }
        let images = await getPlaceImages(place_id);
        placeInfo[0][0].images = images;

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
    const { place_id } = req.body;
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

//visited place list 
const VisitedPlaceList = async (req,res) => {
    const schema = Joi.object({
        userid: Joi.number().required(),
        limit: Joi.number().default(10),
        offset: Joi.number().default(1),
    });

    const { userid } = req.user
    const { limit=10, offset=1 } = req.body;
    try {
        const { error } = schema.validate({ userid,limit,offset });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find visited place list.',
                error: error.details[0].message
            });
        }
        const Page = (offset - 1) * limit;

        let placelists = await getVisitedPlaceList(userid,limit,Page);
        if (!placelists) return res
        .status(400)
        .json({
            message: 'Not able to find visited place list.',
            error: 'No Place Found',
            placelists: []
        });

        return res.json({
            message: 'Visited Place List Found Successfully.',
            placelists: placelists
        })
        
    } catch (error) {
        res.status(400).json({
            message: 'Visited Place List Error.',
            error: error
        });
        
    }

}

const getVisitedPlaceList = async (userid,limit,offset) => {
    try {
        //get place id from rating table and then get place info from place table

        // let query = `SELECT * FROM rating WHERE user_id=${userid} ORDER BY visited_at DESC LIMIT ${limit} OFFSET ${offset}`;
let query = `SELECT rating.*,place.*  FROM rating 
left JOIN place on rating.place_id= place.place_id WHERE user_id=${userid} ORDER BY rating.created_at DESC LIMIT ${limit} OFFSET ${offset}
`;        
console.log(query)
        let placeInfo = await Mysql.execute(query);
        return placeInfo[0];
        
    } catch (error) {
        return false;
        
    }

}

module.exports = {
    PlaceList,
    PlaceInfo,
    PlaceInfoWithAuth,
    updateFavorite,
    VisitedPlaceList
}