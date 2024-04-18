const FAQ = require('../models/FAQ')
const asyncHandler = require('express-async-handler');

const createNewFAQ = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    // Confirming data
    if(!title || !description) {
        return res.status(400).json({message: 'All fields are required!'})
    }

    // Check for duplicates
    const duplicate = await FAQ.findOne({ title }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'A FAQ with this title already exists!' })
    }

    const faqObject = { title, description, status }

    // Create and store new user
    const faq = await FAQ.create(faqObject)

    if(faq) {
        res.status(201).json({ message: `New faq created` })
    } else {
        res.status(400).json({ message: 'Invalid faq data received' })
    }
});

const getAllFAQs = asyncHandler(async (req, res) => {
    const faqs = await FAQ.find().lean()
    if(!faqs?.length) {
        return res.status(400).json({message: 'No FAQs found'})
    }
    res.json(faqs)
})

const updateFAQ = asyncHandler(async (req, res) => {
    const { id, title, description, status} = req.body;

    // confirm data
    if(!id || !title || !description || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const faq = await FAQ.findById(id).exec()

    if(!faq) {
        return res.status(400).json({ message: 'FAQ not found' })
    }

    // check for duplicate
    // const duplicate = await Category.findOne({ name }).lean().exec()

    // // Allow updates to the original user
    // if(duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate category name' })
    // }

    faq.title = title
    faq.description = description
    faq.status = status

    const updatedFAQ = await faq.save();

    res.json({ message: `FAQ updated` })
})

const deleteFAQ = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if(!id) {
        return res.status(400).json({ message: "FAQ ID Required!" })
    }

    const faq = await FAQ.findById(id).exec()
    
    if(!faq) {
        return res.status(400).json({ message: 'FAQ not found' })
    }

    const result = await faq.deleteOne()

    const reply = `FAQ deleted.`

    res.json(reply)
})

module.exports = {
    getAllFAQs, 
    createNewFAQ, 
    updateFAQ,
    deleteFAQ
}