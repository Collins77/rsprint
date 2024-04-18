const Brand = require('../models/Brand')
const asyncHandler = require('express-async-handler');

const createNewBrand = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    // Confirming data
    if(!name) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Brand.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A brand with this name already exists!' })
    }

    const brandObject = { name, status }

    // Create and store new user
    const brand = await Brand.create(brandObject)

    if(brand) {
        res.status(201).json({ message: `New brand created` })
    } else {
        res.status(400).json({ message: 'Invalid brand data received' })
    }
});

const getAllBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find().lean()
    if(!brands?.length) {
        return res.status(400).json({message: 'No Brands found'})
    }
    res.json(brands)
})

const updateBrand = asyncHandler(async (req, res) => {
    const { id, name, status} = req.body;

    // confirm data
    if(!id || !name || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const brand = await Brand.findById(id).exec()

    if(!brand) {
        return res.status(400).json({ message: 'Brand not found' })
    }

    // check for duplicate
    const duplicate = await Brand.findOne({ name }).lean().exec()

    // Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate brand name' })
    }

    brand.name = name
    brand.status = status

    const updatedBrand = await brand.save();

    res.json({ message: `Brand ${updatedBrand.name} updated` })
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
    getAllBrands, 
    createNewBrand, 
    updateBrand,
    deleteBrand
}