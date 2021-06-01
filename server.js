const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const dbConfig = require('./config/database.config.js');

const UserRoutes = require('./routes/user')
const ProductRoutes = require('./routes/product');
const OrderRoutes = require('./routes/orderdetails');
const fileupload = require('express-fileupload')


dotenv.config();

mongoose.Promise = global.Promise;
const app = express();
app.use(fileupload());
mongoose.connect(dbConfig.url,
     {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// create express app
// Middleware 

app.use(express.json());

// Routes 

app.use("/user",UserRoutes);
app.use("/product",ProductRoutes);
app.use("/order",OrderRoutes);

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});