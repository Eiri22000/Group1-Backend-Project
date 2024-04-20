// Import mongoose
const mongoose = require('mongoose');

// Define the Schema for the view
const Schema = mongoose.Schema;
const WorkersWorksitesSchema = new Schema({
    customerName: String,
    phoneNumber: String,
    email: String,
    workAddress: String,
    city: String,
    assignedWorkerId:{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    tasks: [String],
    additionalInformation: String
});

// Create a Mongoose model for the view schema
const WorkersWorksitesModel = mongoose.model('WorkersWorksites', WorkersWorksitesSchema);

// Export the model to make it accessible in other files
module.exports = WorkersWorksitesModel;
