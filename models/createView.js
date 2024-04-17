const mongoose = require('mongoose');

// Define the function to create the MongoDB view
async function createMongoDBView() {
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

    try {
        // Execute the raw MongoDB command to create the view
        await mongoose.connection.db.command({
            create: "workersWorksites",
            viewOn: "worksite",
            pipeline: pipeline
        });

        console.log("MongoDB view 'workersWorksites' created successfully.");
    } catch (error) {
        console.error("Error occurred while creating MongoDB view:", error);
    }
}

module.exports = createMongoDBView;