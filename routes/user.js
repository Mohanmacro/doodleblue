const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { regiesterValidation, loginValidation } = require('../models/validation');

// Validation 
const joi = require('@hapi/joi')



// Create User 
router.post('/signup', async (req, res, next) => {
    const uniqueId = uuidv4();
    // validate before Insert Collection 
    const { error } = regiesterValidation(req.body);
    if (error) return res.send(error.details[0].message);

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send({"Message":"Email already exist","Status code":false});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    const user = new User(
        {
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
            customerID: uniqueId,
        });

    try {
        const savedUser = await user.save();
        res.status(200).send({ "Message": "User Created Sucessfully", "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "User not Created", "Status code": false });
    }
});


// Login 
router.post('/login', async (req, res) => {
    // check user Status 
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ "Message": "Email is Not Found", "Status code": false });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ "Message": "Invalid Password", "Status code": false });

    // create Token 
    const token = jwt.sign({ customerID: user.customerID }, process.env.JWT_KEY);
    res.header('auth-token', token).status(200).send({ "Token": token, "Message": "Login Successfully", "Status code": true });
});


module.exports = router;