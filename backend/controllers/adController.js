const Ad = require('../models/Ads')
const Supplier = require('../models/Supplier')
const asyncHandler = require('express-async-handler');

const createNewAd = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.body.supplierId; // Assuming the supplier ID is provided in the request body
        const supplier = await Supplier.findById(supplierId);
        
        if (!supplier) {
          return res.status(400).json({ message: 'Supplier ID is invalid!' });
        } else {
          const {title,description,startDate,endDate, status, isActive} = req.body

          if(!title || !description || !startDate || !endDate || !description) {
            return res.status(400).json({message: 'All fields are required!'})
            }

          const ad = await Ad.create({
            supplier: supplierId,
            title,
            description,
            startDate,
            endDate,
            status,
            isActive: true
          });
  
          res.status(201).json({
            success: true,
            ad,
          });
        }
      } catch (error) {
        return res.status(400).json(error.message);
      }
});

const getAllAds = asyncHandler(async (req, res) => {
    const ads = await Ad.find().lean()
    if(!ads?.length) {
        return res.status(400).json({message: 'No Ads found'})
    }
    res.json(ads)
})

const updateAd = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { title,description,startDate,endDate, status, isActive } = req.body;

    try {
      const ad = await Ad.findById(id);

      if (!ad) {
        return next(new ErrorHandler('Ad not found', 404));
      }

      ad.title = title || product.title;
      ad.description = description || product.description;
      ad.startDate = startDate || product.startDate;
      ad.endDate = endDate|| product.endDate;
      ad.status = status || product.status;
      ad.isActive = isActive !== undefined ? isActive : ad.isActive;

      await ad.save();

      res.status(200).json({
        success: true,
        message: 'Ad updated successfully!',
        ad,
      });
    } catch (error) {
      return res.status(400).json(error.message);
    }
})

const getAdsBySupplier = asyncHandler(async (req, res) => {
    try {
        const supplierId = req.params.supplierId;
        const ads = await Ad.find({ supplier: supplierId });
        res.status(200).json({ success: true, ads });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch ads' });
    }
})

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "Brand ID Required!" })
    }

    const brand = await Brand.findById(id).exec()
    
    if(!brand) {
        return res.status(400).json({ message: 'Brand not found' })
    }

    const result = await brand.deleteOne()

    const reply = `Brand ${result.name} deleted.`

    res.json(reply)
})

module.exports = {
    getAllAds, 
    createNewAd, 
    updateAd,
    getAdsBySupplier
    // deleteBrand
}