const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/Auth')

const  { 
     PlaceList,
     PlaceInfo,
     PlaceInfoWithAuth
} = require('../Controllers/Place/PlaceList')

router.post('/placelist', PlaceList)
router.get('/placeinfoAuth/:place_id',verifyToken, PlaceInfoWithAuth)
router.get('/placeinfo/:place_id', PlaceInfo)


module.exports = router