const mongoose = require('mongoose')

const appointedWorksitesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
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
    },
    workerFullName: {
        type: String,
        required: true
    }
})

const AppointedWorksites = mongoose.model('AppointedWorksites', appointedWorksitesSchema);
module.exports = AppointedWorksites;