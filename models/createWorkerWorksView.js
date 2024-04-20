const mongoose = require('mongoose');

// Define the function to create the MongoDB view
async function createWorkerWorksView() {
    try {
        // Define the aggregation pipeline for the view
        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "assignedWorkerId",
                    foreignField: "_id",
                    as: "worker"
                }
            },
            {
                $project: {
                    customerName: 1,
                    phoneNumber: 1,
                    email: 1,
                    workAddress: 1,
                    city: 1,
                    assignedWorkerId: 1,
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

// Export the function to create the view
module.exports = createWorkerWorksView;
