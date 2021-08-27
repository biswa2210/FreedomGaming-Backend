/*
CREATED BY

NAME: BISWARUP BHATTACHARJEE
PH NO.: 6290272740
EMAIL: bbiswa471@gmail.com
*/
const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
