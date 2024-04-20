require('dotenv').config();
const API_KEY = process.env.WEATHERAPIKEY; // Replace with your Visual Crossing Weather API key

const weatherAPI = async (location, date) => {
    const API_KEY = process.env.WEATHERAPIKEY; // Replace with your Visual Crossing Weather API key
    const LOCATION = 'New York'; // Replace with the desired location

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${LOCATION}?unitGroup=us&key=${API_KEY}&date=${date}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data; // Return data if needed
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error; // Throw error if needed
    }
};

module.exports = {weatherAPI};