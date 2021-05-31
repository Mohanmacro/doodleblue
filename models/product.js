const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productname: { type: String, required: true, min: 6, max: 255 },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    productId: { type: String, required: true }
})

module.exports = mongoose.model('Product', productSchema)