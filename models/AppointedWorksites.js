const mongoose = require('mongoose')

const AppointedWorksitesSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    customerName: {
        type: String,
        required: true
    },
    chores: {
        type: Array,
        required: true
    },
    worker: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("AppointedWorksitesSchema", AppointedWorksitesSchema)