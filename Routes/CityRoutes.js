const express = require('express')
const router = express.Router()

const  { 
     getAllCities
} = require('../Controllers/City/CityController')

router.get('/', getAllCities)

module.exports = router