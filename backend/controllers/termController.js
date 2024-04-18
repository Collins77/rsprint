const Term = require('../models/Term')
const asyncHandler = require('express-async-handler');

const createNewTerm = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    // Confirming data
    if(!name || !description) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await Term.findOne({ name }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A T & C with this title already exists!' })
    }

    const termObject = { name, description, status }

    // Create and store new user
    const term = await Term.create(termObject)

    if(term) {
        res.status(201).json({ message: `New T&C created` })
    } else {
        res.status(400).json({ message: 'Invalid T&C data received' })
    }
});

const getAllTerms = asyncHandler(async (req, res) => {
    const terms = await Term.find().lean()
    if(!terms?.length) {
        return res.status(400).json({message: 'No T&Cs found'})
    }
    res.json(terms)
})

const updateTerm = asyncHandler(async (req, res) => {
    const { id,  name, description, status} = req.body;

    // confirm data
    if(!id || !name || !description || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const term = await Term.findById(id).exec()

    if(!term) {
        return res.status(400).json({ message: 'T&C not found' })
    }

    // check for duplicate
    // const duplicate = await Category.findOne({ name }).lean().exec()

    // // Allow updates to the original user
    // if(duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate category name' })
    // }

    term.name = title
    term.description = description
    term.status = status

    const updatedTerm = await term.save();

    res.json({ message: `T&C updated` })
})

const deleteTerm = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "T&C ID Required!" })
    }

    const term = await Term.findById(id).exec()
    
    if(!term) {
        return res.status(400).json({ message: 'T&C not found' })
    }

    const result = await term.deleteOne()

    const reply = `T&C deleted.`

    res.json(reply)
})

module.exports = {
    getAllTerms, 
    createNewTerm, 
    updateTerm,
    deleteTerm
}