const Joi = require('joi');
const ApiError = require('../../middleware/Apierrors');
const PlaceModal = require('../../Modals/place.modal');
const { default: mongoose } = require('mongoose');
const Favorite = require('../../Modals/favorite.modal');
const { validatePlaceId } = require('./PlaceList');

const getUserFavPlaces = async (req, res,next) => {
    const schema = Joi.object({
        limit: Joi.number().default(10).max(100),
        offset: Joi.number().default(1).max(20),
    });
    try {
        const { error } = schema.validate(req.query);
        if (error) {
            throw new ApiError(400,error.details[0].message)
        }
        const { limit = 10, offset = 1 } = req.query;
        const Page = (offset - 1) * limit;
        let placeList = await getFavPlaceList(req.user.userid, limit, Page);

        res.json({
            message: 'Place List Found Successfully.',
            placeList: placeList
        });
        
    } catch (error) {
        next(error)
        
    }
}

const getFavPlaceList = async (user_id, limit, offset) => {
    try {

        const result = await Favorite.find({ user: new mongoose.Types.ObjectId(user_id)}).populate('place').skip(offset)
        .limit(Number(limit)).lean()

        // Transform the result to bring place object keys to the parent level
        const transformedResult = result.map(fav => ({
            ...fav.place, // Spread place object properties
            ...fav, // Spread other properties from favorite object
            place: undefined, // Remove the nested place object
        }));
        
        return transformedResult;
    } catch (error) {
        throw new ApiError(500, "Server Error")

    }
}

const deletFromFavPlaceApi = async (req, res, next) => {
    const schema = Joi.object({
        place_id: Joi.string().required()
    });
    try {
        const { place_id } = req.query;
        const { error } = schema.validate(req.query);
        if (error) {
            throw new ApiError(400,error.message)
        }

        const placeValidation = await validatePlaceId(place_id)
        if(!placeValidation){
            throw new ApiError(400, 'invalid place_id')
        }

        let result = await deleteFavPlace(req.user.userid, place_id);
        if (!result) return res.status(404).json({
            message: 'Not able to remove from favorite.',
            error: 'No Place Found',
        });

       return res.json({
            message: 'Place Deleted Successfully.',
        });
        
    } catch (error) {
       next(error)
        
    }
}

const deleteFavPlace = async (user_id, place_id) => {
    try {
        const deleteStatus = await Favorite.deleteOne({user: new mongoose.Types.ObjectId(user_id), place: new mongoose.Types.ObjectId(place_id)})
        return deleteStatus?.deletedCount > 0
    } catch (error) {
        throw new ApiError(500, "Server Error")

    }

}


module.exports = {
    getUserFavPlaces,
    deletFromFavPlaceApi
}