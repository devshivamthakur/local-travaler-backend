const { CITY_LIST_REQUEST } = require("../../Constants/CItyConstants");
const Mysql = require("../../DB/Mysql");

const getAllCities = async (req, res) => {
    try {
        let cities = await Mysql.query("SELECT * FROM city");
        res.status(400).json({
            message: CITY_LIST_REQUEST,
            cities: cities[0]
        });
    } catch (error) {
        res.status(400).json({
            message: "Error",
            error: error
        });
    }
}

module.exports = {
    getAllCities
}