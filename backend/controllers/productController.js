const Product = require('../models/Product')
const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
// const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const multer = require('multer');
const json2csv = require('json2csv').parse;
const csvtojson = require('csvtojson')

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().lean()
    if(!products?.length) {
        return res.status(400).json({message: 'No products found'})
    }
    res.json(products)
})

const createNewProduct = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.body.supplierId; // Assuming the supplier ID is provided in the request body
        const supplier = await Supplier.findById(supplierId);
        
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        } else {
          const {sku,name,category,price,brand,description, warranty, status,isFeatured} = req.body

          if(!sku || !name || !category || !price || !warranty || !brand || !description) {
            return res.status(400).json({message: 'All fields are required!'})
            }

          const product = await Product.create({
            supplier: supplierId,
            sku,
            name,
            category,
            price,
            brand,
            warranty,
            description,
            status: "available",
            isFeatured: true
          });
  
          res.status(201).json({
            success: true,
            product,
          });
        }
      } catch (error) {
        return res.status(400).json(error.message);
      }
})
const adminCreateProduct = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.body.supplierId; // Assuming the supplier ID is provided in the request body
        const supplier = await Supplier.findById(supplierId);
        
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        } else {
          const {sku,name,category,price,brand,description, warranty, status,isFeatured} = req.body

          if(!sku || !name || !category || !price || !warranty || !brand || !description) {
            return res.status(400).json({message: 'All fields are required!'})
            }

          const product = await Product.create({
            supplier: supplierId,
            sku,
            name,
            category,
            price,
            brand,
            warranty,
            description,
            status: "available",
            isFeatured: true
          });
  
          res.status(201).json({
            success: true,
            product,
          });
        }
      } catch (error) {
        return res.status(400).json(error.message);
      }
    
})

const deleteSupplierProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
  
        if (!product) {
          return res.status(404).json({message: 'That product is not found'});
        }
      
        await product.remove();
  
        res.status(201).json({
          success: true,
          message: "Product Deleted successfully!",
        });
      } catch (error) {
        return res.status(400).json(error.message);
      }
})

const getProductsBySupplier = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.params.supplierId;
        const products = await Product.find({ supplier: supplierId });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { sku, name, category, price, brand, description, status, isFeatured } = req.body;

    try {
      const product = await Product.findById(id);

      if (!product) {
        return next(new ErrorHandler('Product not found', 404));
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.brand = brand || product.brand;
      product.sku = sku|| product.sku;
      product.price = price|| product.discountPrice;
      product.category = category || product.category;
      product.status = status || product.status;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

      await product.save();

      res.status(200).json({
        success: true,
        message: 'Product updated successfully!',
        product,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

// Download CSV template for bulk product upload
const downloadTemplate = asyncHandler(async (req, res) => {
  const templateFields = ['sku', 'name', 'category', 'price', 'brand', 'description', 'warranty'];
  const csvString = templateFields.join(',') + '\n';
  res.setHeader('Content-disposition', 'attachment; filename=product_template.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csvString);
});

const uploadBulkProducts = asyncHandler(async (req, res) => {
  // try {
  //   upload.single('file')(req, res, async function (err) {
  //     if (err instanceof multer.MulterError) {
  //       return res.status(400).json({ message: 'An error occurred while uploading the file.' });
  //     } else if (err) {
  //       return res.status(400).json({ message: 'An unknown error occurred while uploading the file.' });
  //     }

  //     // File uploaded successfully, now parse the CSV
  //     const products = [];
  //     const file = req.file;
  //     // const supplierId = req.body;

  //     if (!file) {
  //         return res.status(400).json({ message: 'No file uploaded!' });
  //     }
  //     // Check if supplierId is provided
      

  //     file.stream.pipe(csvParser())
  //       .on('data', (row) => {
  //         // Construct product object with supplierId and CSV data
  //         const product = {
  //           // supplier: supplierId,
  //           sku: row.sku,
  //           name: row.name,
  //           category: row.category,
  //           price: row.price,
  //           brand: row.brand,
  //           description: row.description,
  //           warranty: row.warranty,
  //           status: 'available',
  //           isFeatured: true
  //         };
  //         products.push(product);
  //       })
  //       .on('end', async () => {
  //         // Insert products into database
  //         await Product.insertMany(products);
  //         res.status(201).json({ success: true, message: 'Bulk products uploaded successfully!' });
  //       });
  //   });
  // } catch (error) {
  //   return res.status(400).json({ message: 'An error occurred while uploading the file.' });
  // }
  if (!req.files)
        return res.status(400).send('No files were uploaded.');
     
    const productFile = req.files.file;
    const products = [];
    
    csv
    .parseString(productFile.data.toString(), {
        headers: true,
        ignoreEmpty: true
    })
    .on("data", function(data){
        data['_id'] = new mongoose.Types.ObjectId();
        
        products.push(data);
    })
     .on("end", function(){
         Product.create(products, function(err, documents) {
            if (err) throw err;
         });
         
         res.send(products.length + ' products have been successfully uploaded.');
     });
});

module.exports = {
    getAllProducts, 
    createNewProduct, 
    getProductsBySupplier,
    deleteSupplierProduct,
    updateProduct,
    adminCreateProduct,
    downloadTemplate,
    uploadBulkProducts,
}