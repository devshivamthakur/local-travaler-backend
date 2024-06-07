const mongoose = require('mongoose');

const staticcontentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['TERMS_CONDITION','PRIVACY_POLICY','ABOUT_US']
    },
    description: String
},{
    timestamps: true,
    collection: 'staticcontent'
}
)

 const staticContent = mongoose.model('staticcontent',staticcontentSchema)
 module.exports = staticContent