const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const verify = require("./verifyToken")
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const upload = require('express-fileupload');
const excelToJson = require('convert-excel-to-json');
const app = express();
app.use(upload());

router.get('/upoload', (req, res) => {
    res.sendfile(__dirname + '/index.html')
})
// Create and Update Product 
router.post('/upload', verify, async (req, res, next) => {
    const currentUserToken = jwt.verify(req.headers['auth-token'], process.env.JWT_KEY);

   if(req.files.Product)
   {
    var file = req.files.Product;
    var filename = file.name;
    const baseUploadFolder = "./uploads/";
    var uploadedProducts = [];
    try {
        file.mv(baseUploadFolder + filename, function (err) {
            if (err) {
                res.send(err)
            }
            else {
                const excelData = excelToJson({
                    sourceFile: baseUploadFolder + filename,
                    sheets: [{
                        // Excel Sheet Name
                        name: 'Products',

                        // Header Row -> be skipped and will not be present at our result object.
                        header: {
                            rows: 1
                        },

                        // Mapping columns to keys
                        columnToKey: {
                            A: 'productname',
                            B: 'price',
                            C: 'quantity',
                            D: 'productId'
                        }
                    }]
                });
                uploadedProducts = JSON.parse(JSON.stringify(excelData.Products));

                uploadproduct(uploadedProducts);

            }
        })
        res.status(200).send({ "Message": "Product Uploaded  Successfully", "Status code": true });
    }
    catch (err) {
        res.status(400).send({ "Message": "An error Occurred", "Error Detail": err, "Status code": false });
    }
   }
   else
   {
    res.status(400).send({ "Message": "Invalid key Name",  "Status code": false });
   }
});
async function uploadproduct(uploadedProducts) {
    for (let element of uploadedProducts) {

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
}







module.exports = router;