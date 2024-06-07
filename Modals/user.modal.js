const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,

    },
    google_id: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    username: String,
    profileurl: String
},{
    timestamps: true,
    collection:'Userinfo'
})

 const Userinfo = mongoose.model('Userinfo',userModel)

 module.exports = Userinfo