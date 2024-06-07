const userinfoConstants = require("../../Constants/Userinfo/Userinfoconstants");
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Userinfo = require('../../Modals/user.modal')
const ApiError = require("../../middleware/Apierrors")
require("dotenv").config();
// Function to generate access token
const generateAccessToken = (userid) => {
    return jwt.sign({
        userid: userid,
        currentDateTime: new Date().toISOString()
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
}

const Login = async (req, res,next) => {
    const schema = Joi.object({
        googleId: Joi.string().required(),
        email: Joi.string().email().required(),
        name: Joi.string().required()
    });

    const { googleId, email, name } = req.body;

    try {
        const { error } = schema.validate({ googleId, email, name });
        if (error) {
            throw new ApiError(400,userinfoConstants.USER_DETAILS_ERROR)
        }


        let user = await  checkUserExists(googleId, email);
        if (user) {
            user.token = generateAccessToken(user.id);
            return res.json({
                message: userinfoConstants.USER_DEATAILS,
                user
            });
        }

        user = await insertUser(googleId, email, name);
        if (!user) {
            throw new ApiError(400,userinfoConstants.USER_DETAILS_ERROR)
        }

        user.token = generateAccessToken(user.id);
        res.json({
            message: userinfoConstants.USER_DEATAILS,
            user
        });
    } catch (error) {
        next(error)

    }
};

const checkUserExists = async (googleId, email) => {
    try {
      const result = await Userinfo.findOne({
            $or:[
                {googleId:googleId},
                {
                    email:email
                }
            ]
        },
        {
            createdAt: 0,
            updatedAt: 0
        }
        
        ).lean()

        if (result && result._id) {
            result.id = result._id
        }
        return result

    } catch (error) {
        throw new ApiError(500,userinfoConstants.SERVER_ERROR)
    }
};

const insertUser = async (googleId, email, name) => {
    try {
        const userObject = {
            google_id: googleId,
            email: email,
            name: name
        };

        const result = await Userinfo.create(userObject);
        return await getUserInfo(result._id);
    } catch (error) {
        throw new ApiError(500,userinfoConstants.SERVER_ERROR)
    }
};

const getUserInfo = async (userId) => {
    try {
        const result = await Userinfo.findOne({_id: userId},{
            createdAt: 0,
            updatedAt: 0
        }).lean()

        if (result && result._id) {
            result.id = result._id
        }
        return result
    } catch (error) {
        throw new ApiError(500,userinfoConstants.SERVER_ERROR)
    }
};

const userinfo = async (req, res,next) => {
    const schema = Joi.object({
        userid: Joi.string().required() // Changed to string since ObjectId is a string
    });

    const { userid } = req.user;
    try {
        const { error } = schema.validate({ userid });
        if (error) {
         throw  ApiError(400,userinfoConstants.USER_DETAILS_ERROR)
        }

        const user = await getUserInfo(userid);

        if (user) {
            return res.json({
                message: userinfoConstants.USER_DEATAILS,
                user
            });
        }

        throw  ApiError(400,userinfoConstants.USER_DETAILS_ERROR)
    } catch (error) {
        next(error)

    }
};



module.exports = {
    Login,
    userinfo
};
