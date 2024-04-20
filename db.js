const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
MONGODB_URI='mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully!');
        return mongoose.connection.db; // Return the MongoDB database instance
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

module.exports = connectDB;