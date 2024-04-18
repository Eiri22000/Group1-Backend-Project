const mongoose = require('mongoose')

const worksiteSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    workAddress: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    tasks: {
        type: Array,
    },
    additionalInformation: {
        type: String
    },
    isAssigned: {
        type: Boolean,
    }
})

module.exports = mongoose.model("Worksite", worksiteSchema)