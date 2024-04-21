const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0';

const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Database connected successfully!');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log('Listening on port: ' + PORT));
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

module.exports = connectDB;