const mongoose = require('mongoose');
const placeImage = new mongoose.Schema({
    image: String,
},{
    timestamps: true,
})

export const PlaceImage = mongoose.model('placeImage', placeImage)