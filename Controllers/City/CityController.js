const { CITY_LIST_REQUEST } = require("../../Constants/CItyConstants");
const cityModal = require("../../Modals/city.modal");
const ErrorMessageContants = require("../../Utils/ErrorMessageContants");
const Joi = require('joi');
const ApiError = require("../../middleware/Apierrors");

const getAllCities = async (req, res,next) => {
    try {
        
        const cities = await cityModal.find({})
        res.status(200).json({
            message: CITY_LIST_REQUEST,
            cities: cities
        });
    } catch (error) {
        next(new ApiError(500,ErrorMessageContants.SERVER_ERROR))

    }
}

const addCity = async (req, res, next) => {

    const joiObject = Joi.object({
        city_name: Joi.string().required(),
        city_image: Joi.string().required()
    })

    try{
        const { city_image, city_name} = req.body

        const {error} = joiObject.validate({
            city_image,city_name
        })

        if(error){
            throw new ApiError(400,error.message)
        }
    
        const {isCityAdded = false, error:CreateError = null} = await addCityFromDb(city_image,city_name)
        if(!isCityAdded){
            throw new ApiError(400, CreateError)
        }

        res.json({
            message: 'City added successfully'
        })

    }catch(error){
        next(error)
    }


}

const addCityFromDb = async (cityImage, cityName) => {
    try {
        const existingCity = await cityModal.findOne({ city_name: cityName });
        
        if (existingCity) {
            return { error: "City already exists" };
        }

        await cityModal.create({ city_name: cityName, city_image: cityImage });
        return { isCityAdded: true };
        
    } catch (error) {
        throw new ApiError(500, ErrorMessageContants.SERVER_ERROR);
    }
};


module.exports = {
    getAllCities,
    addCity
};
