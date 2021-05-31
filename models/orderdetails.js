const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerID: { type: String, required: true },
    createdDate: { type: String, required: true },
    status: { type: String, required: true },
    updatedDate: { type: String, required: true },
    orderID: { type: String, required: true },
    products: [
        {
            productname: { type: String, required: true, min: 6, max: 255 },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            productId: { type: String, required: true },
        }
    ]
})

module.exports = mongoose.model('Order', OrderSchema)