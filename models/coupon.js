const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String
    },
    name: {
        type: String
    },
    discount: {
        type: Number
    }
})

module.exports = mongoose.model('Couponcode', couponSchema);