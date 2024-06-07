const mongoose = require('mongoose');
const PlaceListConstants = require('../Constants/PlaceList');

const place = new mongoose.Schema({
    place_name: String,
    place_category: {
        type: String,
        enum:[
            PlaceListConstants.POPULAR_DESTINATION,
            PlaceListConstants.TEMPLE,
            PlaceListConstants.LAKE,
            PlaceListConstants.MOUNTAIN,
            PlaceListConstants.BEACH,
            PlaceListConstants.FOOD_AND_RESTAURANTS,
            PlaceListConstants.CAFE,
            PlaceListConstants.BARS_AND_DRINKING
        ]
    },
    banner_image: String,
    address: String,
    rating: Number,
    total_visited: Number,
    lat_long: String,
    discription: String,
    city:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'City'
    },
    placeimage:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'placeImage'
        }
    ]

},{
    timestamps: true,
    collection:"places"
})

const PlaceModal = mongoose.model('place',place)

module.exports = PlaceModal