const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'SuperAdmin'
    },
    status: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true
}
)



module.exports = mongoose.model('Admin', adminSchema)