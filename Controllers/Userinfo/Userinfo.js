const userinfoConstants = require("../../Constants/Userinfo/Userinfoconstants");
const Mysql = require("../../DB/Mysql");
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require("dotenv").config();

// Function to generate access token
const generateAccessToken = (userid) => {
    return jwt.sign({
        userid: userid,
        currentDateTime: new Date().toISOString()
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
}
const Login = async (req, res) => {
    const schema = Joi.object({
        googleId: Joi.string().required(),
        email: Joi.string().email().required(),
        name: Joi.string().required()
    });

    const { googleId, email, name } = req.body;

    try {
        const { error } = schema.validate({ googleId, email, name });
        if (error) {
            return res.status(400)
            .json({
                message: userinfoConstants.USER_DEATAILS_ERROR,
                error: error.details[0].message
            });
        }

        let userExists = await checkUserExists(googleId, email);
        if (userExists) {
            userExists.token=generateAccessToken(userExists.id)
            return res.json({
                message: userinfoConstants.USER_DEATAILS,
                user: userExists
            });
        }

        let newUser = await insertUser(googleId, email, name);
        if(!newUser) return res.status(400).json({
            message: userinfoConstants.USER_DEATAILS_ERROR,
            error: userinfoConstants.USER_NOT_CREATED
        });


        newUser.token=generateAccessToken(newUser.id)
        res.json({
            message: userinfoConstants.USER_DEATAILS,
            user: newUser
        });
    } catch (error) {
        res.status(400).json({
            message: userinfoConstants.USER_DEATAILS_ERROR,
            error: error
        });
    }
};

// Function to check if user already exists
const checkUserExists = async(googleId, email) => {
    return Mysql.execute('SELECT * FROM userinfo WHERE google_id = ? AND email = ?', [googleId, email])
        .then(([rows, fields]) => {
            return rows.length > 0 ? rows[0] : null;
        })
        .catch(err => {
            throw err;
        });
};

// Function to insert a new user
const insertUser = async(googleId, email, name) => {
    return Mysql.execute('INSERT INTO userinfo (google_id, email, name) VALUES (?,?,?)', [googleId, email, name])
        .then(([rows, fields]) => {

            return rows.insertId > 0 ? GetUserinfo(rows.insertId) : null;

        })
        .catch(err => {
            throw err;
        });
};

const GetUserinfo = async(userid) => {
    try {
        return Mysql.execute('SELECT * FROM userinfo WHERE id = ? ', [userid])
        .then(([rows, fields]) => {

            return rows.length > 0 ? rows[0] : null;
        })
        .catch(err => {
            throw err;
        });
    } catch (error) {
        
    }
    

}

// Function to get user details by id
const userinfo =async (req, res) => {

    const schema= Joi.object({
        userid: Joi.number().required()
    });

    const { userid } = req.user
    try {
        const { error } = schema.validate({ userid });
        if (error) {
            return res.json({
                message: userinfoConstants.USER_DEATAILS_ERROR,
                error: error.details[0].message
            });
        }

        const userinfo = await GetUserinfo(userid);

        if (userinfo) {
            return res.json({
                message: userinfoConstants.USER_DEATAILS,
                user: userinfo
            });
        }

        res.json({
            message: userinfoConstants.USER_DEATAILS_ERROR,
            error: userinfoConstants.USER_NOT_FOUND
        });
        
    } catch (error) {
        
    }


}


module.exports = {
    Login,
    userinfo
};
