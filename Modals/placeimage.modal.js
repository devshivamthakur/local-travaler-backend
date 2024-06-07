const mongoose = require('mongoose');
const placeImage = new mongoose.Schema({
    image: String,
},{
    timestamps: true,
})

const PlaceImage = mongoose.model('placeImage', placeImage)

module.exports = PlaceImage