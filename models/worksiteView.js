const mongoose = require('mongoose');

// Define the Schema for the view
const WorkersWorksitesSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: String,
    email: String,
    workAddress: String,
    city: String,
    tasks: [String],
    additionalInformation: String
});

// Define the model for the view
const WorkersWorksitesModel = mongoose.model('workersWorksites', WorkersWorksitesSchema, 'workersWorksites');

// Define the function to create the MongoDB view
async function workerWorksView() {
    try {
        // Define the aggregation pipeline for the view
        const pipeline = [
            {
                $lookup: {
                    from: "appointedworksites",
                    localField: "customerName",
                    foreignField: "customerName",
                    as: "workerWorksites"
                }
            },
            {
                $project: {
                    customerName: 1,
                    phoneNumber: 1,
                    email: 1,
                    workAddress: 1,
                    city: 1,
                    tasks: "$workerWorksites.chores",
                    additionalInformation: "$workerWorksites.additionalInformation"
                }
            }
        ];

        // Create the view using Mongoose's Model.aggregate() method
        const viewResult = await WorkersWorksitesModel.aggregate(pipeline).exec();
        
        // Output the result if needed
        console.log("MongoDB view 'workersWorksites' created successfully:", viewResult);
    } catch (error) {
        console.error("Error occurred while creating MongoDB view:", error);
    }
}

module.exports = workerWorksView;
