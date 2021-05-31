const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const verify = require("./verifyToken")
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Create and Update Product 
router.post('/upload', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);

    try {
        const requestedProducts = req.body.Products;
        for (let element of requestedProducts) {
            const requestOrder = await Product.findOne({ productname: element.productname, price: element.price });
            if (requestOrder) {
                const updatedProduct = await Product.findOneAndUpdate({ productId: requestOrder.productId }, { quantity: requestOrder.quantity + element.quantity }, { new: true });
            }
            else {
                const uniqueId = uuidv4();
                const newProduct = await Product.create(
                    {
                        productname: element.productname,
                        price: element.price,
                        quantity: element.quantity,
                        productId: uniqueId
                    });
            }
        }

        res.status(200).send({ "Message": "Product Uploaded  Successfully", "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": false });
    }
});





module.exports = router;