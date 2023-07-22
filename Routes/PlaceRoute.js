const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/Auth')

const  { 
     PlaceList,
     PlaceInfo,
     PlaceInfoWithAuth,
     updateFavorite
} = require('../Controllers/Place/PlaceList')

const {
     deletFromFavPlaceApi

} = require('../Controllers/Place/FavPlace')
router.post('/placelist', PlaceList)
router.get('/placeinfoAuth/:place_id',verifyToken, PlaceInfoWithAuth)
router.get('/placeinfo/:place_id', PlaceInfo)
router.post('/updateFavorite',verifyToken, updateFavorite)
router.post('/submitRating',verifyToken, require('../Controllers/Place/Rating').SubmitRating)
router.get('/favplaces',verifyToken, require('../Controllers/Place/FavPlace').getUserFavPlaces)
router.delete('/deleteFavPlace',verifyToken, deletFromFavPlaceApi)

module.exports = router