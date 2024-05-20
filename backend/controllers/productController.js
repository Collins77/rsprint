const Product = require('../models/Product')
const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');
const multer = require('multer');

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

const getProductById = asyncHandler(async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if(!product) {
          return res.status(404).json({ message: 'Product not found!' });
      }
    res.status(201).json({
      success: true,
      product,
    });
    } catch (error) {
      return res.status(500).json(error.message);
    }
})

const deleteSupplierProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({message: 'Product is not found'});
  }

  await product.deleteOne()

  res.status(201).json({
    success: true,
    message: "Product Deleted successfully!",
  });
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
    const { sku, name, category, price, brand, warranty, description, status, isFeatured } = req.body;

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
      product.warranty = warranty || product.warranty;
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
  const templateFields = ['sku', 'name', 'category', 'price($)', 'brand', 'description', 'warranty(Months)'];
  const csvString = templateFields.join(',') + '\n';
  res.setHeader('Content-disposition', 'attachment; filename=product_template.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csvString);
});

const uploadBulkProducts = asyncHandler(async (req, res) => {
  try {
    const products = req.body;
    const insertedProducts = await Product.insertMany(products);
    if (insertedProducts) {
      res.status(200).json({ success: true, message: "Products inserted successfully" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" })
  }
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
    getProductById
}