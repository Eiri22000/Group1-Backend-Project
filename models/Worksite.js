const mongoose = require('mongoose')

const worksiteSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Worksite", worksiteSchema)