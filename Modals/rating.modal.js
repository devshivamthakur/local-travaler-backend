const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'place'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Userinfo'
    }
}, {
    timestamps: true,
}
)

export const Rating = mongoose.model('Rating', ratingSchema)
