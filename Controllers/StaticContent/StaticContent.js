const Joi = require('joi');
const MongoDb = require("../../DB/MongoDb");
const ApiError = require('../../middleware/Apierrors');
const ErrorMessageContants = require('../../Utils/ErrorMessageContants');
const staticContent = require('../../Modals/staticcontent.modal');

const Types=['TERMS_CONDITION','PRIVACY_POLICY','ABOUT_US']

const getStaticContent = async (req, res,next) => {
    const schema = Joi.object({
        type: Joi.string().valid(...Types).required()
    });
    try {
        const { error } = schema.validate(req.query);
        if (error) {
            throw new ApiError(400,error.details[0].message)
        }
        const { type } = req.query;
        let staticContent = await getStaticContentFromDB(type);
        if (!staticContent) throw new ApiError(404,'not found')

        res.json({
            message: 'Static Content Found Successfully.',
            staticContent: staticContent
        });
        
    } catch (error) {

       next(error)
        
    }
}

const getStaticContentFromDB = async (type) => {
    try {
        const result = await staticContent.findOne({ type: type},{
          projection:{
            type:1,
            description:1,
          }
        })
        
        

        return result || {};
    } catch (error) {
        throw new ApiError(500,ErrorMessageContants.SERVER_ERROR)

    }
}

module.exports = {
    getStaticContent
}
