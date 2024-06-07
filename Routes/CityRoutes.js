const express = require('express')
const router = express.Router()

const  { 
     getAllCities,
     addCity
} = require('../Controllers/City/CityController')
const verifyToken = require('../middleware/Auth')

router.get('/', getAllCities)
router.post("/addCity", verifyToken, addCity)

module.exports = router