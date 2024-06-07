const mongoose = require('mongoose');

const city = new mongoose.Schema({
    city_name: {
        unique: true,
        type: String
    },
    city_image: String,
    
},{
    timestamps: true, //it will add createdAt and updatedAt to the database
    collection:'City'
}
)

const cityModal = mongoose.model('City',city)

module.exports = cityModal