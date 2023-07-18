const express = require('express')
const router = express.Router()

const  { 
     PlaceList
} = require('../Controllers/Place/PlaceList')

router.post('/placelist', PlaceList)

module.exports = router