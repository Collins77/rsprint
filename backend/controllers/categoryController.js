const Category = require('../models/Category')
const asyncHandler = require('express-async-handler');
const Product = require('../models/Reseller')

const createNewCategory = asyncHandler(async (req, res) => {
    const { name, status } = req.body;

    // Confirming data
    if(!name) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Category.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A Category with this name already exists!' })
    }

    const categoryObject = { name, status }

    // Create and store new user
    const category = await Category.create(categoryObject)

    if(category) {
        res.status(201).json({ message: `New category ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid category data received' })
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().lean()
    if(!categories?.length) {
        return res.status(400).json({message: 'No categories found'})
    }
    res.json(categories)
})

const updateCategory = asyncHandler(async (req, res) => {
    const { id, name, status,} = req.body;

    // confirm data
    if(!id || !name || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const category = await Category.findById(id).exec()

    if(!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    // check for duplicate
    // const duplicate = await Category.findOne({ name }).lean().exec()

    // // Allow updates to the original user
    // if(duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate category name' })
    // }

    category.name = name
    category.status = status

    const updatedCategory = await category.save();

    res.json({ message: `${updatedCategory.name} updated` })
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "Category ID Required!" })
    }
    const product = await Product.findOne({ category: id }).lean().exec()

    if(product) {
        return res.status(400).json({ message: "Category has products" })
    }

    const category = await Category.findById(id).exec()
    
    if(!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    const result = await category.deleteOne()

    const reply = `Category ${category.name} with ID ${category._id} deleted.`

    res.json(reply)
})

module.exports = {
    getAllCategories, 
    createNewCategory, 
    updateCategory,
    deleteCategory
}