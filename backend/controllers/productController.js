const Product = require('../models/Product')
const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendMail = require('../middleware/sendMail');
const fs = require('fs');
const path = require('path');

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
        console.log(supplier)
        
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        } else {
          const {sku,name,category,price,brand,description,status,isFeatured} = req.body

          if(!sku || !name || !category || !price || !brand || !description) {
            return res.status(400).json({message: 'All fields are required!'})
            }

          const product = await Product.create({
            supplier: supplierId,
            sku,
            name,
            category,
            price,
            brand,
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
    // try {
    //     const supplierId = req.body.supplierId;
    //     const supplier = await Supplier.findById(supplierId);
    //     if (!supplier) {
    //       return next(new ErrorHandler("Shop Id is invalid!", 400));
    //     } else {
    //       const productData = req.body;
    //       productData.supplier = supplier;
  
    //       const product = await Product.create(productData);
  
    //       res.status(201).json({
    //         success: true,
    //         product,
    //       });
    //     }
    //   } catch (error) {
    //     return next(new ErrorHandler(error, 400));
    //   }
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

module.exports = {
    getAllProducts, 
    createNewProduct, 
    getProductsBySupplier,
    deleteSupplierProduct,
    updateProduct,
    // updateReseller,
    // loginReseller,
    // getReseller,
    // deleteReseller
}