const Admin = require('../models/Admin')
// const Note = require('../models/Note')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllAdmins = async (req, res) => {
    // Get all users from MongoDB
    const admins = await Admin.find().lean()

    // If no users 
    if (!admins?.length) {
        return res.status(400).json({ message: 'No admins found' })
    }

    res.json(admins)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewAdmin = async (req, res) => {
    const { username,email, password, role, status } = req.body;

    // Confirm data
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await Admin.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate email' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const adminObject = (!Array.isArray(role) || !role.length)
        ? { username, "password": hashedPwd, email, status }
        : { username, "password": hashedPwd, role, email, status }

    // Create and store new user 
    const admin = await Admin.create(adminObject)

    if (admin) { //created 
        res.status(201).json({ message: `New admin ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid admin data received' })
    }
}

// @desc Update a user
// @route PATCH /users
// @access Private
const updateAdmin = async (req, res) => {
    const { id, username, role, active, password, email } = req.body

    // Confirm data 
    if (!id || !username || !email) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const admin = await Admin.findById(id).exec()

    if (!admin) {
        return res.status(400).json({ message: 'Admin not found' })
    }

    // Check for duplicate 
    const duplicate = await Admin.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    admin.username = username
    admin.email = email
    admin.role = role
    admin.active = active

    if (password) {
        // Hash password 
        admin.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedAdmin = await admin.save()

    res.json({ message: `${updatedAdmin.username} updated` })
}

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteAdmin = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Admin ID Required' })
    }

    // Does the user exist to delete?
    const admin = await Admin.findById(id).exec()

    if (!admin) {
        return res.status(400).json({ message: 'Admin not found' })
    }

    const result = await admin.deleteOne()

    const reply = `Admin ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAdmins,
    createNewAdmin,
    updateAdmin,
    deleteAdmin
}