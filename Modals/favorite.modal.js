const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "place"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId
    }
},{
    timestamps: true
}
)


const Favorite = mongoose.model('Favorite',favoriteSchema)

module.exports = Favorite

