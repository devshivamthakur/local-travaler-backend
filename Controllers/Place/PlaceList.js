const PlaceListConstants = require("../../Constants/PlaceList");
const Joi = require('joi');
const ApiError = require("../../middleware/Apierrors");
const PlaceModal = require("../../Modals/place.modal");
const mongoose = require("mongoose");
const Favorite = require("../../Modals/favorite.modal");
const Rating = require("../../Modals/rating.modal");

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

const PlaceList = async (req, res, next) => {
    const schema = Joi.object({
        placeType: Joi.string().valid(...PLACETYPE).required(),
        limit: Joi.number().default(10).max(100),
        offset: Joi.number().default(1).max(20),
        city_id: Joi.string().required().min(1)


    });
    //city must be greater than 0

    const { placeType, limit = 10, offset = 1, city_id } = req.body;

    try {
        const { error } = schema.validate({ placeType, limit, offset, city_id });
        if (error) {
            throw new ApiError(400, error.details[0].message)
        }
        const Page = (offset - 1) * limit;

        let placeList = await getPlaceList(placeType, limit, Page, city_id);

        res.json({
            message: 'Place List Found Successfully.',
            placeList: placeList
        });
    } catch (error) {
        next(error)
    }
}

const getPlaceList = async (placeType, limit, offset, city_id) => {
    try {
        const result = await PlaceModal.aggregate(
            [
                {
                    $match: {
                        city: new mongoose.Types.ObjectId(city_id),

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

        return result;


    } catch (error) {
        throw new ApiError(500, "Server Error")

    }

}

///place info
const PlaceInfo = async (req, res, next) => {
    const schema = Joi.object({
        place_id: Joi.string().required()
    });
    const { place_id } = req.params;

    try {
        const { error } = schema.validate({ place_id });
        if (error) {
            throw new ApiError(400, error.details[0].message)
        }

        const placeValidation = await validatePlaceId(place_id)
        if(!placeValidation){
            throw new ApiError(400, 'invalid place_id')
        }

        let placeInfo = await getPlaceInfo(place_id);

        res.json({
            message: 'Place Info Found Successfully.',
            placeInfo: placeInfo
        });
    } catch (error) {
        next(error);
    }

}

const getPlaceInfo = async (place_id) => {

    try {

        const result = await PlaceModal.findOne({
            _id: new mongoose.Types.ObjectId(place_id)
        })
            .populate('city')
            .populate('placeimage').lean()

        if (result && result.city) {
            result.city = result.city.city_name
        }
        return result;
    } catch (error) {
        throw new ApiError(500, "Server Error")

    }
};

const PlaceInfoWithAuth = async (req, res, next) => {
    const schema = Joi.object({
        userid: Joi.string().required(),
        place_id: Joi.string().required()
    });

    const { userid } = req.user
    const { place_id } = req.params;
    try {
        const { error } = schema.validate({ userid, place_id });
        if (error) {
            throw new ApiError(400, error.details[0].message)

        }

        const placeValidation = await validatePlaceId(place_id)
        if(!placeValidation){
            throw new ApiError(400, 'invalid place_id')
        }

        let placeInfo = await getPlaceInfoWithAuth(place_id, userid);

        res.json({
            message: 'Place Info Found Successfully.',
            placeInfo: placeInfo
        });

    } catch (error) {
        next(error);

    }

}


const getPlaceInfoWithAuth = async (place_id, userid) => {
    try {
        const result = await PlaceModal.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(place_id)
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    let: { placeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$place', "$$placeId"] },
                                        { $eq: ['$user', new mongoose.Types.ObjectId(userid)] }
                                    ]
                                }
                            }
                        },
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
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    userRating: "$usersRating.rating"
                }
            },
            {
                $lookup: {
                    from: "favorites",
                    let: { placeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$place', "$$placeId"] },
                                        { $eq: ['$user', new mongoose.Types.ObjectId(userid)] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "favorites"
                }
            },
            {
                $addFields: {
                    is_fav: {
                        $gt: [{ $size: '$favorites' }, 0]
                    }
                }
            },
            {
                $project: {
                    usersRating: 0,
                    favorites: 0
                }
            }
        ]);

        return result[0] || {};
    } catch (error) {
        throw new ApiError(500, "Server Error");
    }
};


//update favorite
const updateFavorite = async (req, res, next) => {
    const schema = Joi.object({
        userid: Joi.string().required(),
        place_id: Joi.string().required()
    });

    const { userid } = req.user
    const { place_id } = req.body;
    try {
        const { error } = schema.validate({ userid, place_id });
        if (error) {
            throw new ApiError(400, error.details[0].message)

        }

        const placeValidation = await validatePlaceId(place_id)
        if(!placeValidation){
            throw new ApiError(400, 'invalid place_id')
        }

        let placeInfo = await FavoriteActions(place_id, userid);
        if (!placeInfo) throw new ApiError(401,"Not able to update favorite.")

        return res.json({
            message: 'Favorite Updated Successfully.',

        })

    } catch (error) {
        next(error);
    }

}

const FavoriteActions = async (place_id, userid) => {
    try {

        const favorite = await Favorite.findOne({ place: new mongoose.Types.ObjectId(place_id), user: userid })
        if (favorite) {
            const deleteStatus = await Favorite.deleteOne({ place: new mongoose.Types.ObjectId(place_id), user: new mongoose.Types.ObjectId(userid) });
            return deleteStatus;
        }

        const addFav = await Favorite.create({
            place: new mongoose.Types.ObjectId(place_id),
            user: new mongoose.Types.ObjectId(userid),
        });

        return addFav;

    } catch (error) {
        throw new ApiError(500, "Server Error")


    }

}

//visited place list 
const VisitedPlaceList = async (req, res, next) => {
    const schema = Joi.object({
        userid: Joi.string().required(),
        limit: Joi.number().default(10),
        offset: Joi.number().default(1),
    });

    const { userid } = req.user
    const { limit = 10, offset = 1 } = req.body;
    try {
        const { error } = schema.validate({ userid, limit, offset });
        if (error) {
            throw new ApiError(400, error.details[0].message)

        }
        const Page = (offset - 1) * limit;

        let placelists = await getVisitedPlaceList(userid, limit, Page);

        return res.json({
            message: 'Visited Place List Found Successfully.',
            placelists: placelists
        })

    } catch (error) {
       next(error);

    }

}

const getVisitedPlaceList = async (userid, limit, offset) => {
    try {

        const results = await Rating.aggregate(
            [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userid),
                    }
                },
                {
                    $lookup: {
                        from: "places",
                        localField: "place",
                        foreignField: "_id",
                        as: "placeData"
                    }
                },

                {
                    $unwind: {
                        path: "$placeData"
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: { $mergeObjects: ["$placeData", "$$ROOT"] } // Merge placeData fields with the root document
                    }
                },
                {
                    $sort: {
                        created_at: -1
                    }
                },
                {
                    $project: {
                        placeData: 0,
                        _id: 0
                    }
                }
            ]
        ).limit(limit).skip(offset)

        return results;

    } catch (error) {
        throw new ApiError(500, "Server Error")


    }

}

 const validatePlaceId = async(placeId) => {
    if(typeof placeId !== "string") throw new ApiError(400, "Invalid place id")
    const results = await PlaceModal.findOne({_id: new mongoose.Types.ObjectId(placeId)})
    if(!results) return false;
    return true
}
//

module.exports = {
    PlaceList,
    PlaceInfo,
    PlaceInfoWithAuth,
    updateFavorite,
    VisitedPlaceList,
    validatePlaceId
}