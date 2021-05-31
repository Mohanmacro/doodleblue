const express = require('express');
const router = express.Router();
const Order = require('../models/orderDetails');
const jwt = require('jsonwebtoken');
const verify = require("./verifyToken")
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const _ = require('lodash');
const moment = require('moment');





// Create Order 
router.post('/createorder', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    const today = moment();
    var createdDate = today.format();
    createdDate = createdDate.slice(0, 10)
    const status = "Created";
    const updatedDate = " ";
    try {
        const orderedProducts = req.body.OrderedProducts;
        const uniqueId = uuidv4();
        const orderID = uuidv4();
        const order = Order.create(
            {
                products: orderedProducts.products,
                customerID: currentUserToken.customerID,
                createdDate: createdDate,
                updatedDate: updatedDate,
                status: status,
                orderID: orderID
            });
        res.status(200).send({ "Message": "Product Ordered Successfully", "OrderId": orderID, "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": false });
    }
});

// Update Order 

router.put('/updateorder', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    const today = moment();
    var updatedDate = today.format();
    updatedDate = updatedDate.slice(0, 10)
    const currentStatus = "Updated";
    try {
        const requestOrder = await Order.findOneAndUpdate({ orderID: req.body.UpdatedProducts.orderID }, { products: req.body.UpdatedProducts.products, status: currentStatus, updatedDate: updatedDate }, { new: true });
        res.status(200).send({ "Message": "Order Updated Successfully", "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": true });
    }
});

// Cancel Order 

router.post('/cancelorder', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    const today = moment();
    var updatedDate = today.format();
    updatedDate = updatedDate.slice(0, 10)
    const currentStatus = "Cancelled";
    try {
        const requestOrder = await Order.findOneAndUpdate({ orderID: req.body.canceledProduct.orderID }, { status: currentStatus, updatedDate: updatedDate }, { new: true });
        res.status(200).send({ "Message": "Order Cancelled Successfully", "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": true });
    }
});

// Get Ordered Products based on Customer

router.get('/orderedproducts', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    const orderDetails = await Order.find({ customerID: currentUserToken.customerID });
    if (!orderDetails) return res.status(400).send({ "Message": "No Order Available", "Status code": true });
    if (orderDetails) return res.status(200).send({ "Message": "Success", "orderedproducts": orderDetails, "Status code": true });
});

// Get Ordered Products Count based on Date

router.get('/orderedproductsbydate', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    const orderDetails = await Order.find({ customerID: currentUserToken.customerID }, { createdDate: req.body.date });
    const OrdersbyDatesCount = orderDetails.length;
    if (!orderDetails) return res.status(400).send({ "Message": "No Order Available", "Status code": true });
    if (orderDetails) return res.status(200).send({ "Message": "Success", "Orders Count": OrdersbyDatesCount, "Status code": true });
});

// Get Customer based purchased products Count

router.get('/orderdetails', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    try {
        const orderDetails = await Order.aggregate([{ "$group": { _id: "$customerID", orderCount: { $sum: 1 } } }]);
        let customerIDS = [];
        orderDetails.forEach(element => {
            customerIDS.push(element._id)
        });
        const customerDocs = await User.find({ customerID: { $in: customerIDS } });
        let groupedCustomerDocs = _.groupBy(customerDocs, "customerID");
        orderDetails.forEach(element => {
            element["customerName"] = groupedCustomerDocs[element._id][0].name
        });
        if (!orderDetails) return res.status(400).send({ "Message": "No Order Available", "Status code": true });
        if (orderDetails) return res.status(200).send({ "Message": "Success", "OrderDetails": orderDetails, "Status code": true });

    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": false });
    }

});

// Search Products information 

router.post('/search', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);
    try {
        let matchquerry = {};
        matchquerry["customerID"] = currentUserToken.customerID;
        // searchby productname here 
        matchquerry["products.productname"] = req.body.searchkey;
        if (matchquerry != undefined) {
            if (req.body.orderBy == "createdDate" && req.body.isAscending) {
                const sortedOrderDetails = await Order.find(matchquerry).sort({ createdDate: -1 });
                res.status(200).send({ "Results": sortedOrderDetails, "Status code": true });
            }
            else if (req.body.orderBy == "createdDate" && req.body.isAscending != true) {
                const sortedOrderDetails = await Order.find(matchquerry).sort({ createdDate: 1 });
                res.status(200).send({ "Results": sortedOrderDetails, "Status code": true });
            }
            else if (req.body.orderBy == "status" && req.body.isAscending) {
                const sortedOrderDetails = await Order.find(matchquerry).sort({ status: 1 });
                res.status(200).send({ "Results": sortedOrderDetails, "Status code": true });
            }
            else if (req.body.orderBy == "status" && req.body.isAscending != true) {
                const sortedOrderDetails = await Order.find(matchquerry).sort({ status: -1 });
                res.status(200).send({ "Results": sortedOrderDetails, "Status code": true });
            }
            else if ((req.body.orderBy == "") && ((req.body.isAscending != true) || (req.body.isAscending))) {
                const orderDetails = await Order.find(matchquerry).sort({ createdDate: -1 });
                res.status(200).send({ "Results": orderDetails, "Status code": true });
            }
            else {
                res.status(200).send({ "Message": "No Item Found", "Status code": false });
            }
        }
        else {
            res.status(400).send({ "Message": "No Item Found", "Error Detail": err, "Status code": false });
        }
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Ocured", "Error Detail": err, "Status code": false });
    }
});







module.exports = router;