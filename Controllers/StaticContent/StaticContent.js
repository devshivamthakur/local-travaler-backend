const Mysql = require("../../DB/Mysql");
const Joi = require('joi');

const Types=['TERMS_CONDITION','PRIVACY_POLICY','ABOUT_US']

const getStaticContent = async (req, res) => {
    const schema = Joi.object({
        type: Joi.string().valid(...Types).required()
    });
    try {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
                error: error.details[0].message
            });
        }
        const { type } = req.query;
        let staticContent = await getStaticContentFromDB(type);
        if (!staticContent) return res.json({
            message: 'Not able to find static content.',
            error: 'No Content Found',
            staticContent: {}
        });

        res.json({
            message: 'Static Content Found Successfully.',
            staticContent: staticContent
        });
        
    } catch (error) {
        res.status(400).json({
            message: 'Static Content Error',
            error: error
        });
        
    }
}

const getStaticContentFromDB = async (type) => {
    try {
        let sql = `SELECT * FROM staticcontent WHERE type = '${type}'`;
        let result = await Mysql.execute(sql);
        return result[0][0];
    } catch (error) {
        throw error;
    }
}
  
module.exports = {
    getStaticContent
}
