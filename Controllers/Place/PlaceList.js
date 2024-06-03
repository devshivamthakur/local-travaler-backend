const PlaceListConstants = require("../../Constants/PlaceList");
const Joi = require('joi');
const MongoDb = require("../../DB/MongoDb");

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
        limit: Joi.number().default(10).max(100),
        offset: Joi.number().default(1).max(20),
        city_id: Joi.number().required().min(1)


    });
    //city must be greater than 0

    const { placeType, limit = 10, offset = 1, city_id } = req.body;

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
        console.log(error.message);
        res.status(501).json({
            message: 'Place List Error',
            error: 'Place List Error'
        });
    }
}

const getPlaceList = async (placeType, limit, offset, city_id) => {
    try {
        const db = await MongoDb.connect()


        const result = await db.collection("place").aggregate(
            [
                {
                    $match: {
                        city_id: city_id,

                        ...placeType != PlaceListConstants.POPULAR_DESTINATION && {
                            place_category: placeType
                        }
                    }
                },
                {
                    $sort: {
                        rating: -1
                    }
                }
            ]
        )
            .skip(offset)
            .limit(Number(limit))
            .toArray()

        return result;


    } catch (error) {
        throw error

    }

}

///place info

const PlaceInfo = async (req, res) => {
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
            placeInfo: {}
        });

        res.json({
            message: 'Place Info Found Successfully.',
            placeInfo: placeInfo
        });
    } catch (error) {
        res.status(500).json({
            message: 'server error',
            error: 'error'
        });
    }

}

const getPlaceInfo = async (place_id) => {
    let db;

    try {
         db = await MongoDb.connect();  // Get the client

        const result = await db.collection('place').aggregate(
            [
                {
                    $match: {
                        place_id: Number(place_id)
                    }
                },
                {
                    $lookup: {
                        from: "placeimage",
                        localField: "place_id",
                        foreignField: "place_id",
                        as: 'images'
                    }
                }
            ]
        ).toArray();

        return result[0] || {};
    } catch (error) {
        console.log(error);
    } finally {
        if (db) {
            await db.close();  // Ensure the client is closed
        }
    }
};

const PlaceInfoWithAuth = async (req, res) => {
    const schema = Joi.object({
        userid: Joi.number().required(),
        place_id: Joi.number().required()
    });

    const { userid } = req.user
    const { place_id } = req.params;
    try {
        const { error } = schema.validate({ userid, place_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find place info.',
                error: error.details[0].message
            });
        }

        let placeInfo = await getPlaceInfoWithAuth(place_id, userid);
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

const getPlaceInfoWithAuth = async (place_id, userid) => {

    let db;

    try {

         db = await MongoDb.connect()
        const result = await db.collection('place').aggregate([

            {
                $match: {
                    place_id: Number(place_id)
                }
            },
            {
                $lookup: {
                    from: "rating",
                    let: {
                        placeId: '$place_id'
                    },
                    pipeline: [
                        {

                            $match: {

                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$place_id', '$$placeId'],
                                            $eq: ['$user_id', Number(userid)]

                                        }
                                    ]
                                }

                            }

                        }
                        ,
                        {
                            $project: {
                                rating: 1,
                                _id: 0
                            }
                        }
                    ],
                    as: "usersRating"

                }
            },
            {
                $unwind: {
                    path: '$usersRating',
                    preserveNullAndEmptyArrays: true  // Equivalent to LEFT JOIN
                }
            },
            {
                $addFields: {
                    userRating: "$usersRating.rating"
                }
            },
            {
                $lookup: {
                    from: "placeimage",
                    localField: "place_id",
                    foreignField: "place_id",
                    as: 'images'
                }
            }
            ,
            {
                $lookup:{
                    from:"favorite",
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:{
                                        $eq:['place_id', Number(place_id)],
                                        $eq:['user_id', Number(userid)]

                                    }
                                }
                            }
                        }
                    ],
                    as :"favorites"
                }
            },
            {
                $addFields:{
                  is_fav:{
                    $gt:[
                        {
                            $size:'$favorites'
                        },
                        0
                    ]
                  }  
                }
            },{
                $project:{
                    usersRating:0,
                    favorites:0
                }
            },

        ]).toArray()

        return result[0] || {};
    } catch (error) {
        console.log('error', error)
        throw error

    }
    
}


//update favorite
const updateFavorite = async (req, res) => {
    const schema = Joi.object({
        userid: Joi.number().required(),
        place_id: Joi.number().required()
    });

    const { userid } = req.user
    const { place_id } = req.body;
    try {
        const { error } = schema.validate({ userid, place_id });
        if (error) {
            return res.status(400).json({
                message: 'Not able to update favorite.',
                error: error.details[0].message
            });
        }

        let placeInfo = await FavoriteActions(place_id, userid);
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
        res.status(501).json({
            message: 'server error.',
            error: 'Error updating favorite'
        });

    }

}

const FavoriteActions = async (place_id, userid) => {
    try {
        const db = await MongoDb.connect()

        const favorite = await db.collection('favorite').findOne({place_id: Number(place_id),user_id:userid})
        if(favorite){
            const deleteStatus = await db.collection('favorite').deleteOne({place_id: Number(place_id),user_id:userid});
            return deleteStatus;

        }

        const addFav = await db.collection('favorite').insertOne({
            place_id: Number(place_id),
            user_id:userid,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return addFav;

    } catch (error) {
        return false;

    }

}

//visited place list 
const VisitedPlaceList = async (req, res) => {
    const schema = Joi.object({
        userid: Joi.number().required(),
        limit: Joi.number().default(10),
        offset: Joi.number().default(1),
    });

    const { userid } = req.user
    const { limit = 10, offset = 1 } = req.body;
    try {
        const { error } = schema.validate({ userid, limit, offset });
        if (error) {
            return res.status(400).json({
                message: 'Not able to find visited place list.',
                error: error.details[0].message
            });
        }
        const Page = (offset - 1) * limit;

        let placelists = await getVisitedPlaceList(userid, limit, Page);
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
        res.status(500).json({
            message: 'server error',
            error: 'Server error'
        });

    }

}

const getVisitedPlaceList = async (userid, limit, offset) => {
    try {
        userid = 6
        console.log('Getting Visited Place List',userid, limit, offset)
        
        const db = await MongoDb.connect();
        const results = await db.collection('rating').aggregate(
            [
                {
                    $match:{
                        user_id:Number(userid)
                    }
                },
                {
                    $lookup:{
                        from:"place",
                        localField:"place_id",
                        foreignField:"place_id",
                        as:"placeData"
                    }
                },

                {
                    $unwind:{
                        path:"$placeData"
                    }
                },
                {
                    $replaceRoot: {
                      newRoot: { $mergeObjects: ["$placeData", "$$ROOT"] } // Merge placeData fields with the root document
                    }
                  },
                {
                    $sort:{
                        created_at:-1
                    }
                },
                {
                    $project:{
                        placeData:0,
                        _id:0
                    }
                }
            ]
        ).limit(limit).skip(offset).toArray()

        return results;

    } catch (error) {
        console.log(error)
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