const express = require('express');

const app = express();
const dotenv = require('dotenv');
const UserRoutes = require('./routes/user');
const OrderSchema = require('./routes/orderdetails');

dotenv.config();

// Routes 

app.use("/user",UserRoutes);
app.use("/order",OrderSchema);

app.listen(3000);